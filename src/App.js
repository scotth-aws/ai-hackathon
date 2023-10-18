import { Routes, Route, BrowserRouter } from "react-router-dom"
import Home from "./Components/Home/index.jsx"
import Questions from "./Components/Questions/index.jsx"
import GenQuestions from "./Components/GenQuestions/index.jsx"
import Upload from "./Components/Upload/index.jsx"
import LectureDownload from "./Components/LectureDownload/index.jsx"


function App() {
 return (
   <div className="App">
     <BrowserRouter>
       <Routes>
       <Route path="/" element={<Home />} />
           <Route path="/Home" element={<Home />} />
           <Route path="/Upload" element={<Upload />} />
           <Route path="/Questions" element={<Questions />} />
           <Route path="/GenQuestions" element={<GenQuestions />} />
           <Route path="/LectureDownload" element={<LectureDownload />} />
      
       </Routes>
     </BrowserRouter>
   </div>
 )
}

export default App