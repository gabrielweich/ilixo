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
    favorites: []
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
    this.setState({ data: [], fetching: true });
    const { data } = await axios.get(`/api/addresses?street=${value}`);
    this.setState({ data: uniqBy(data, "address_code"), fetching: false });
  };

  handleChange = async value => {
    console.log({ value });
    this.setState({
      value,
      data: [],
      fetching: false
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

  onSaveFavorite = async (address_code, number, label) => {
    await axios.post("/api/favorites", {
      address_code,
      number,
      label,
      user_id: DEFAULT_USER_ID
    });
    this.getUserFavorites();
  };

  getUserFavorites = async () => {
    const favorites = await axios.get(
      `/api/favorites?user_id=${DEFAULT_USER_ID}`
    );
    console.log(favorites);
  };

  render() {
    const { fetching, data, value } = this.state;
    return (
      <div className="home-container">
        <Select
          showSearch
          labelInValue
          value={value}
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
        <p className="collect-time">{this.state.collectTime}</p>
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
          onSaveFavorite={this.onSaveFavorite}
          open={this.state.favoriteModalOpen}
          onClose={() => this.setState({ favoriteModalOpen: false })}
        />
      </div>
    );
  }
}

export default Home;
