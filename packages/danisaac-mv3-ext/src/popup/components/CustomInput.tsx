import React from 'react'

export function CustomInput(props) {
  return (
    <input
      onChange={props.onChange}
      type={props.type}
      placeholder={props.placeholder}
      value={props.value}
      style={{
        height: 20,
        padding: 8,
        width: 200,
        border: '1px solid black'
      }}
    />
  )
}
