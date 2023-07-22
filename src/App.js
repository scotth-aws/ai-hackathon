import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./Components/Home/index.jsx"
import Questions from "./Components/Questions/index.jsx"
import Upload from "./Components/Upload/index.jsx"


function App() {
 return (
   <div className="App">
     <BrowserRouter>
       <Routes>
       <Route path="/" element={<Home />} />
           <Route path="/Home" element={<Home />} />
           <Route path="/Upload" element={<Upload />} />
           <Route path="/Questions" element={<Questions />} />
      
       </Routes>
     </BrowserRouter>
   </div>
 )
}

export default App