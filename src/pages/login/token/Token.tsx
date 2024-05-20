import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import qs from "qs";
import * as Figma from "figma-api";
import { userToken } from "../../../App";

const Token = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(userToken);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get("code");

  const getAuth = async () => {
    const client_id = "BZJc0SEHkwOU7UErsVhyrA";
    const client_secret = "OxAtlMz1Kf7iMCd1gZLWrKn3KtkAqX";
    const redirect_uri = "http://localhost:3000/oauth/token";
    const grant_type = "authorization_code";
    const p = {
      client_id,
      client_secret,
      redirect_uri,
      grant_type,
      code,
    };
    const options: any = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(p),
      url: "https://www.figma.com/api/oauth/token",
    };
    const data = await axios(options);
    console.log(data);
    setToken(data.data);
    localStorage.setItem("token", JSON.stringify(data.data));
    navigate("/");
  };

  useEffect(() => {
    // if (code !== states) {
    //   // check "code" params
    //   // ...do something
    // }

    getAuth();
  }, []);

  return <div></div>;
};

export default Token;
