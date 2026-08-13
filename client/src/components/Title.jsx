import React from 'react'

const Title = ({ title, subTitle, align, font }) => {
  return (
    <div
      className={`flex flex-col justify-center items-center text-center ${
        align === "left" ? "md:items-start md:text-left" : ""
      }`}
    >
      <h1 className={`text-4xl md:text-[40px] ${font || "font-playfair"}`}>
        {title}
      </h1>

      <p
  className={`text-sm md:text-base max-w-xl text-gray-500 ${
    align === "left" ? "text-left" : "text-center"
  }`}
>
  {subTitle}
</p>
    </div>
  )
}

export default Title