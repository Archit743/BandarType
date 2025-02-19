import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LogIn from './LogIn';
import Register from './Register';
import '../Styles/EntryPage.css';

const EntryPage = () => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  return ( 
    <>
    <div className='container'>
      <div className='header'>   
        <div>bandar type</div>
      </div>
      <section className='body'>   
        <button className='login' onClick={() => setOpen(true)}>
          Login
        </button>
        <button className='register'  onClick={() => setOpen2(true)}>
          Register 
        </button>
      </section>
    </div>
    {open && <LogIn setOpen = {setOpen}/>}
    {open2 && <Register setOpen={setOpen} setOpen2 = {setOpen2}/>}
    </>
  );
};

export default EntryPage;
