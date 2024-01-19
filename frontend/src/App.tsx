import './App.css'
import {
  Route,
  BrowserRouter,
  Routes,
} from "react-router-dom";
import Landing from './components/Landing';
import notfound from './components/notfound';

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' Component={Landing}/>
        <Route path='*' Component={notfound} />
      </Routes>

    </BrowserRouter>
  )
}

export default App
