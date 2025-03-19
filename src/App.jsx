
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./component/Registration_login/Registration_login";
import LinkOrFileInput from "./component/LinkOrFileInput"
import TableComponent from "./component/Registration_login/TableComponent";

const Dashboard = () => (
  // <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "flex-start" }}>
<div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "flex-start", width: "98vw" }}>    
    <LinkOrFileInput />
    <TableComponent />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
