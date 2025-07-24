import React from 'react'

const BlurCirle = ({top = "auto", right="auto", bottom="auto", left="auto"}) => {
  return (
    <div className="absolute bg-primary/30 w-58 aspect-square rounded-full blur-3xl -z-50"
    style={{
        top: top,
        bottom: bottom,
        left: left,
        right: right
    }}
    >
   
    </div>
  )
}

export default BlurCirle