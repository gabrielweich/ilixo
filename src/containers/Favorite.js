import React from "react";
import { Modal, Select, Spin, Input, Button, Divider, Table } from "antd";
import debounce from "lodash/debounce";
import uniqBy from "lodash/uniqBy";
import axios from "axios";
import NumericInput from "../components/NumericInput";

const { Option } = Select;

export default class Favorite extends React.Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchAddresses = debounce(this.fetchAddresses, 800);
  }

  state = {
    data: [],
    value: {},
    fetching: false,
    number: null,
    name: null,
    saveLoading: false,
    selectedFavoriteId: null
  };

  fetchAddresses = async value => {
    this.setState({ data: [], fetching: true });
    const { data } = await axios.get(`/api/addresses?street=${value}`);
    this.setState({ data: uniqBy(data, "address_code"), fetching: false });
  };

  handleChange = async value => {
    this.setState({
      value,
      data: [],
      fetching: false
    });
  };

  onChangeNumber = value => {
    this.setState({ number: value });
  };

  onChangeName = event => {
    const name = event.target.value;
    this.setState({ name });
  };

  onSave = async () => {
    this.setState({ saveLoading: true });
    const { value, number, name, selectedFavoriteId } = this.state;

    const baseData = {
      address_code: parseInt(value.key),
      address_number: parseInt(number),
      address_street: value.label,
      label: name
    };

    if (selectedFavoriteId) {
      await this.props.onUpdateFavorite({
        ...baseData,
        favorite_id: selectedFavoriteId
      });
    } else {
      await this.props.onSaveFavorite(baseData);
    }

    this.setState({
      saveLoading: false,
      value: {},
      number: null,
      name: null,
      selectedFavoriteId: null
    });
  };

  onClickFavorite = ({ address }) => {
    this.setState({
      selectedFavoriteId: address.favorite_id,
      number: address.address_number,
      name: address.label,
      value: { key: address.address_code, label: address.address_street }
    });
  };

  onCancel = () => {
    this.setState(
      { value: {}, number: null, name: null, selectedFavoriteId: null },
      this.props.onClose
    );
  };

  render() {
    const { fetching, data, value } = this.state;

    return (
      <Modal
        title="Meus endereços"
        visible={this.props.open}
        onCancel={this.onCancel}
        footer={null}
      >
        <div>
          <div>
            <Select
              showSearch
              labelInValue
              value={value && Object.keys(value).length ? value : undefined}
              placeholder="Digite a rua"
              notFoundContent={fetching ? <Spin size="small" /> : null}
              filterOption={false}
              onSearch={this.fetchAddresses}
              onChange={this.handleChange}
              style={{ width: "100%" }}
            >
              {data.map(d => (
                <Option key={d.address_code}>{d.street}</Option>
              ))}
            </Select>
          </div>
          <div style={{ marginTop: 15 }}>
            <NumericInput
              style={{ width: "100%" }}
              value={this.state.number}
              onChange={this.onChangeNumber}
            />
          </div>
          <div style={{ marginTop: 15 }}>
            <Input
              value={this.state.name}
              onChange={this.onChangeName}
              placeholder="Nome do endereço"
            />
          </div>
          <div
            style={{
              marginTop: 15,
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <Button
              loading={this.state.saveLoading}
              type="primary"
              onClick={this.onSave}
            >
              Salvar
            </Button>
          </div>
        </div>
        <Divider />
        <div>
          <Table
            onRow={record => ({
              onClick: () => this.onClickFavorite(record) // click row
            })}
            size="small"
            scroll={{ y: 140 }}
            pagination={false}
            columns={this.tableColumns}
            showHeader={false}
            dataSource={this.tableRows}
            locale={{ emptyText: "Você não ainda não tem um local salvo." }}
          />
        </div>
      </Modal>
    );
  }

  get tableRows() {
    return Object.values(this.props.favorites).map(v => ({ address: v }));
  }

  get tableColumns() {
    return [
      {
        title: "Endereço",
        dataIndex: "address",
        render: row => (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <p style={{ marginBottom: 0 }}>
                <b>{row.label}</b>
              </p>
              <p style={{ marginBottom: 0 }}>
                {row.address_street} - {row.address_number}
              </p>
            </div>
            <Button
              onClick={e => {
                e.stopPropagation()
                this.props.onDeleteFavorite(row.favorite_id);
              }}
              shape="circle"
              icon="delete"
            />
          </div>
        )
      }
    ];
  }
}
