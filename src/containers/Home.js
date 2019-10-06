import React from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import axios from 'axios';


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
  };


  async componentDidMount(){
    await navigator.geolocation.getCurrentPosition(
      async position => {
        console.log({position})
        const {latitude, longitude} = position.coords
        const {data} = await axios.get(`/api/garbage-collection/coordinates?latitude=${latitude}&longitude=${longitude}`)
        if (data && data.length){
            console.log({street, address_code})
            this.setState({value: data[0] })
        } 
      }, 
      err => console.log(err)
    );
  }

  fetchUser = async value => {
    console.log('fetching user', value);
    
  };

  handleChange = value => {
    this.setState({
      value,
      data: [],
      fetching: false,
    });
  };

  render() {
    const { fetching, data, value } = this.state;
    return (
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
    );
  }
}


export default Home