import React, { createContext, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Lading from "./pages/lading/Lading";
import Logins from "./pages/login/Logins";
import { uuid } from "uuidv4";
import Token from "./pages/login/token/Token";
import Figma from "./pages/figma/Figma";

export const userToken = createContext<any>(null);

const App = () => {
  const [token, setToken] = useState<any>(null);
  return (
    <BrowserRouter>
      <userToken.Provider
        value={{
          token,
          setToken,
        }}
      >
        <Routes>
          <Route path="/" element={<Lading />} />
          <Route path="/oauth/token" element={<Token />} />
          <Route path="/login" element={<Logins />} />
          <Route path="/:fileKey" element={<Figma />} />
        </Routes>
      </userToken.Provider>
    </BrowserRouter>
  );
};

export default App;
