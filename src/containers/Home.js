import React from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import uniqBy from 'lodash/uniqBy'
import axios from 'axios';
import NumericInput from '../components/NumericInput';
import { Button } from 'antd';


const { Option } = Select;



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
    collectTime: ''
  };


  async componentDidMount() {
    console.log('Requesting position')
    await navigator.geolocation.getCurrentPosition(
      async position => {
        console.log({ position })
        const { latitude, longitude } = position.coords
        const { data } = await axios.get(`/api/garbage-collection/coordinates?latitude=${latitude}&longitude=${longitude}`)
        if (data && data.length) {
          const { street, address_code } = data[0]
          this.setState({ value: { key: address_code, label: street } })
        }
      },
      err => console.log(err)
    );
  }

  fetchUser = async value => {
    console.log('fetching user', value);
    this.setState({ data: [], fetching: true })
    const { data } = await axios.get(`/api/addresses?street=${value}`)
    this.setState({ data: uniqBy(data, 'address_code'), fetching: false })
  };

  handleChange = async value => {
    console.log({ value })
    this.setState({
      value,
      data: [],
      fetching: false,
    });
  };

  onSearch = async () => {
    this.setState({loading: true})
    const { number, value } = this.state
    if (number && value.key) {
      const { data } = await axios.get(`/api/garbage-collection?address_code=${value.key}&number=${number}`)
      if (data && data.time){
        this.setState({collectTime: data.time})
      }
    }
    this.setState({loading: false})
  }

  onChangeNumber = (value) => {
    this.setState({ number: value })
  }

  render() {
    const { fetching, data, value } = this.state;
    return (
      <div>
        <Select
          showSearch
          labelInValue
          value={value}
          placeholder="Digite a rua"
          notFoundContent={fetching ? <Spin size="small" /> : null}
          filterOption={false}
          onSearch={this.fetchUser}
          onChange={this.handleChange}
          style={{ width: '100%' }}
        >
          {data.map(d => (
            <Option key={d.address_code}>{d.street}</Option>
          ))}
        </Select>
        <div style={{ marginTop: 20 }}>
          <NumericInput style={{ width: '100%' }} value={this.state.number} onChange={this.onChangeNumber} />
          <div style={{ marginTop: 20 }} />
          <Button onClick={this.onSearch} type="primary" block loading={this.state.loading}>Buscar</Button>
        </div>
        <p className="collect-time">{this.state.collectTime}</p>
      </div>
    );
  }
}


export default Home