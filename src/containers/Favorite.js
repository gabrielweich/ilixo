import React from "react";
import { Modal, Select, Spin, Input, Button, Divider, Table } from "antd";
import debounce from "lodash/debounce";
import uniqBy from "lodash/uniqBy";
import axios from "axios";
import NumericInput from "../components/NumericInput";

const { Option } = Select;

const FAVORITE_COLUMNS = [
  {
    title: "Endereço",
    dataIndex: "address"
  }
];

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
    saveLoading: false
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
    const { value, number, name } = this.state;
    await this.props.onSaveFavorite(
      parseInt(value.key),
      parseInt(number),
      value.label,
      name
    );
    this.setState({ saveLoading: false });
  };

  render() {
    const { fetching, data, value } = this.state;

    return (
      <Modal
        title="Meus endereços"
        visible={this.props.open}
        onCancel={this.props.onClose}
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
          <Table columns={[]} showHeader={false} dataSource={[]} />
        </div>
      </Modal>
    );
  }
}
