import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Home from '../Home';
import Upload from '../Upload';

const Routing = (
    <Router>
      <div>
        <Routes>  

        <Route path="/Home" element={<Home />} />
        <Route path="/Upload" element={<Upload />} />
        
        </Routes>
      </div>
    </Router>
  );
  
  export default Routing;