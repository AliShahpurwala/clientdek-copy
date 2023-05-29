import React from 'react';
import InputText from './inputs/InputText';
import Switch from '@mui/material/Switch';
import { formatAPIKey } from "../utils/ClientdekUtils";

export default function InputForm(props) {

  const renderType = ({param = props.type, disabled = false, error = false}) => {
    switch(param) {
      case "text":
      case "password":
      case "date":
      default:
        return <InputText error={error} name={props.name} type={param} value={props.value} placeholder={props.placeholder} onChange={props.handleText} disabled={disabled}/>;
      case "toggle":
        return <Switch checked={props.value}
                       name={props.name}
                       onChange={props.handleToggle}
                />
      case "select":
        return <select onChange={props.handleText} name={props.name} value={props.value} >
          {
            props.selectableOptions.map((option) => {
              return (
                <option value={option} >{option}</option>
              )
            })
          }
        </select>
    }
  }

  return (
    <div className="rounded p-1">
      <p className="w-1/4 mr-1 whitespace-nowrap text-on-surface dark:text-on-surface-dark">
        {formatAPIKey(props.name)}
      </p>
      <div>
        {renderType({param: props.type, disabled: props.isDisabled})}
      </div>
    </div>
  );
};
