import React from "react";
import { Select, Spin, Button, Icon, Divider } from "antd";
import debounce from "lodash/debounce";
import uniqBy from "lodash/uniqBy";
import axios from "axios";
import NumericInput from "../components/NumericInput";
import { Link } from "react-router-dom";
import Favorite from "./Favorite";

const { Option } = Select;

const DEFAULT_USER_ID = 1;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchUser = debounce(this.fetchUser, 800);
  }

  state = {
    data: [],
    value: {},
    fetching: false,
    number: null,
    loading: false,
    collectTime: "",
    favoriteModalOpen: false,
    favorites: {},
    addressNotFound: false
  };

  async componentDidMount() {
    this.getUserFavorites();
    await navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const { data } = await axios.get(
          `/api/garbage-collection/coordinates?latitude=${latitude}&longitude=${longitude}`
        );
        if (data && data.length) {
          const { street, address_code } = data[0];
          this.setState({ value: { key: address_code, label: street } });
        }
      },
      err => console.log(err)
    );
  }

  fetchUser = async value => {
    if (value) {
      this.setState({ data: [], fetching: true });
      const { data } = await axios.get(`/api/addresses?street=${value}`);
      this.setState({
        data: uniqBy(data, "address_code"),
        fetching: false,
        addressNotFound: false
      });
    } else this.setState({ data: [] });
  };

  handleChange = async value => {
    const { favorites } = this.state;
    const extra =
      value.key in favorites
        ? { number: favorites[value.key].address_number }
        : {};

    this.setState({
      value,
      data: [],
      fetching: false,
      ...extra
    });
  };

  onSearch = async () => {
    this.setState({ loading: true });
    const { number, value } = this.state;
    if (number && value.key) {
      const { data } = await axios.get(
        `/api/garbage-collection?address_code=${value.key}&number=${number}`
      );
      if (data && data.time) {
        this.setState({ collectTime: data.time });
      } else {
        this.setState({ addressNotFound: true });
      }
    }
    this.setState({ loading: false });
  };

  onChangeNumber = value => {
    this.setState({ number: value });
  };

  editSavedAddresses = () => {
    this.setState({ favoriteModalOpen: true });
  };

  onSaveFavorite = async (
    address_code,
    address_number,
    address_street,
    label
  ) => {
    await axios.post("/api/favorites", {
      address_code,
      address_number,
      address_street,
      label,
      user_id: DEFAULT_USER_ID
    });
    this.getUserFavorites();
  };

  onDeleteFavorite = async favorite_id => {
    await axios.delete(
      `/api/favorites?user_id=${DEFAULT_USER_ID}&favorite_id=${favorite_id}`
    );
    this.getUserFavorites();
  };

  getUserFavorites = async () => {
    const { data } = await axios.get(
      `/api/favorites?user_id=${DEFAULT_USER_ID}`
    );
    if (!data) return;
    const favoriteMap = data.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.favorite_id]: curr
      }),
      {}
    );
    this.setState({ favorites: favoriteMap });
  };

  render() {
    const { fetching, data, value } = this.state;
    return (
      <div className="home-container">
        <Select
          showSearch
          labelInValue
          value={value && Object.keys(value).length ? value : undefined}
          placeholder="Digite a rua"
          notFoundContent={fetching ? <Spin size="small" /> : null}
          filterOption={false}
          onSearch={this.fetchUser}
          onChange={this.handleChange}
          style={{ width: "100%" }}
          dropdownRender={menu => (
            <div>
              {menu}
              <Divider style={{ margin: "4px 0" }} />
              <div
                style={{ padding: "4px 8px", cursor: "pointer" }}
                onMouseDown={e => e.preventDefault()}
                onClick={this.editSavedAddresses}
              >
                <Icon type="pushpin" /> Editar endereços salvos
              </div>
            </div>
          )}
        >
          {!fetching && !data.length
            ? Object.values(this.state.favorites).map(d => (
                <Option key={d.favorite_id}>☆ {d.label}</Option>
              ))
            : null}

          {data.map(d => (
            <Option key={d.address_code}>{d.street}</Option>
          ))}
        </Select>
        <div style={{ marginTop: 20 }}>
          <NumericInput
            style={{ width: "100%" }}
            value={this.state.number}
            onChange={this.onChangeNumber}
          />
          <div style={{ marginTop: 20 }} />
          <Button
            onClick={this.onSearch}
            type="primary"
            block
            loading={this.state.loading}
          >
            Buscar
          </Button>
        </div>
        {this.state.collectTime ? (
          <p className="collect-time">{this.state.collectTime}</p>
        ) : this.state.addressNotFound ? (
          <p className="address-not-found">
            Não foi encontrado horário de coleta para esse endereço.
          </p>
        ) : null}

        <div style={{ textAlign: "center" }}>
          <Link to="/hints">
            <Button
              type="primary"
              shape="round"
              style={{
                borderColor: "transparent",
                backgroundColor: "rgba(52, 199, 89)",
                marginTop: 30
              }}
            >
              Dicas de Reciclagem
            </Button>
          </Link>
        </div>
        <Favorite
          onDeleteFavorite={this.onDeleteFavorite}
          favorites={this.state.favorites}
          onSaveFavorite={this.onSaveFavorite}
          open={this.state.favoriteModalOpen}
          onClose={() => this.setState({ favoriteModalOpen: false })}
        />
      </div>
    );
  }
}

export default Home;
