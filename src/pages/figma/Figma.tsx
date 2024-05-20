import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userToken } from "../../App";
import Canvas from "../../components/Canvas";
import {
  GetFileNodesResult,
  GetFileResult,
  GetImageResult,
} from "figma-api/lib/api-types";
import axios from "axios";
// import { getFile, getImgs, getNodes } from "../../utils/fetchAPI";

const Figma = () => {
  const { user } = useContext(userToken);
  const params = useParams();

  const [data, setData] = useState<GetFileResult | null>(null);
  const [imgsData, setImgsData] = useState<null | GetImageResult>(null);
  const getFile = async () => {
    let user = localStorage.getItem("token");
    if (!user) return;
    const token = JSON.parse(user);
    return await axios.get(
      `https://api.figma.com/v1/files/SuluaS192SLm7iAxHf4QX3`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );
  };

  const getImgs = async () => {
    let user = localStorage.getItem("token");
    if (!user) return;
    const token = JSON.parse(user);
    return await axios.get(
      `https://api.figma.com/v1/files/SuluaS192SLm7iAxHf4QX3/images`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );
  };

  const getNodes = async () => {
    let user = localStorage.getItem("token");
    if (!user) return;
    const token = JSON.parse(user);
    return await axios.get(
      `https://api.figma.com/v1/images/SuluaS192SLm7iAxHf4QX3?ids=I12:311;0:593`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );
  };

  const getDatas = async () => {
    try {
      const [file, imgs, nodes]: any = await Promise.all([
        getFile(),
        getImgs(),
        getNodes(),
      ]);
      setData(file.data);
      setImgsData(imgs.data.meta.images);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const key = params.fileKey;
    console.log(key);

    getDatas();
  }, []);
  return <div>{data && <Canvas data={data} />}</div>;
};

export default Figma;
