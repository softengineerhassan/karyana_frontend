import React from 'react'
import { Toaster } from 'react-hot-toast'

const ToasterComponent = () => {
  return (
    <Toaster
      position='top-right'
      reverseOrder={false}
      gutter={8}
      containerClassName=''
      containerStyle={{}}
      toastOptions={{
        className: '',
        duration: 1500,
        style: {
          background: '#363636',
          color: '#fff',
          zIndex: 99999
        },
        success: {
          duration: 1500,
          theme: {
            primary: 'green',
            secondary: 'black'
          }
        }
      }}
    />
  )
}

export default ToasterComponent
