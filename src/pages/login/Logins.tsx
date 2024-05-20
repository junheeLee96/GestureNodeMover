import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { userToken } from "../../App";

const Logins = () => {
  // const { setToken } = useContext(userToken);

  return (
    <div>
      <Link
        to={`https://www.figma.com/oauth?client_id=BZJc0SEHkwOU7UErsVhyrA&redirect_uri=http://localhost:3000/oauth/token&scope=files:read,file_comments:write&state=${"state"}&response_type=code`}
      >
        Login!!
      </Link>
    </div>
  );
};

export default Logins;
