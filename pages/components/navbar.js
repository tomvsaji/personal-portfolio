import React from 'react'

const Navbar = () => {
  return (
    <div className="navbar">
      <a href="#about">About</a>
      <a href="#works">Works</a>
      <a href="#contact">Contact</a>
    <style jsx>{`
    .navbar {
      display: flex;
      flex-direction: row;
      text-decoration: none;
      align-items: center;
      justify-content: center;
      height: 80px;
      background: #000000;
    }

    .navbar a {
      text-decoration: none;
      margin-right: 50px;
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 300;
      font-size: 24px;
      color: #FFFFFF;
      background-image: linear-gradient(#4B02E8,#4B02E8);
      background-size: 0 100%;
      background-repeat: no-repeat;
      transition: .4s;
    }

    .navbar a:hover {
      background-size: 100% 100%;
    }
    `}</style>
    </div>
  )
}

export default Navbar