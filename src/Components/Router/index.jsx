import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Home from '../Home';

const Routing = (
    <Router>
      <div>
        <Routes>  
        <Route path="/" element={<Home />}></Route>
        <Route path="/Home" element={<Home />} />
        
        </Routes>
      </div>
    </Router>
  );
  
  export default Routing;