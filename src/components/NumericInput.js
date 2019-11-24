import React from "react";
import { Input, Tooltip } from "antd";

class NumericInput extends React.Component {
  onChange = e => {
    const { value } = e.target;
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === "" || value === "-") {
      this.props.onChange(value);
    }
  };

  render() {
    const { value } = this.props;
    const title = !value && "Digite o número da sua residência";

    return (
      <Tooltip
        trigger={["focus"]}
        title={title}
        placement="topLeft"
        overlayClassName="numeric-input"
      >
        <Input
          {...this.props}
          onChange={this.onChange}
          placeholder="Número"
          maxLength={25}
        />
      </Tooltip>
    );
  }
}

export default NumericInput;
