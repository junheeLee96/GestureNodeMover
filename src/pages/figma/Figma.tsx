import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { userToken } from "../../App";
import {
  GetFileNodesResult,
  GetFileResult,
  GetImageResult,
} from "figma-api/lib/api-types";
import axios from "axios";
import WebGL from "./webGL/WebGL";
import Three from "./webGL/Three";
import Pixi from "./pixi/Pixi";
// import { Canvas } from "@react-three/fiber";
// import { getFile, getImgs, getNodes } from "../../utils/fetchAPI";

interface ImgsDataCtxType {
  imgsData: GetImageResult | null;
}

export const ImgsDataCtx = createContext<ImgsDataCtxType | null>(null);

const Figma = () => {
  const { user } = useContext(userToken);
  const params = useParams();

  const [data, setData] = useState<GetFileResult | null>(null);
  const [imgsData, setImgsData] = useState<null | GetImageResult>(null);
  const getFile = async () => {
    let user = localStorage.getItem("token");
    if (!user) return;
    const fileKey = params.fileKey;
    const token = JSON.parse(user);
    return await axios.get(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });
  };

  const getImgs = async () => {
    let user = localStorage.getItem("token");
    if (!user) return;
    const fileKey = params.fileKey;
    const token = JSON.parse(user);
    return await axios.get(`https://api.figma.com/v1/files/${fileKey}/images`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });
  };

  const getNodes = async () => {
    let user = localStorage.getItem("token");
    if (!user) return;
    const token = JSON.parse(user);
    const fileKey = params.fileKey;
    //   SuluaS192SLm7iAxHf4QX3;
    return await axios.get(
      `https://api.figma.com/v1/images/${fileKey}?ids=I12:311;0:593`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );
  };

  const getDatas = async () => {
    try {
      // await Promise.all([getFile(), getImgs()]).then(callSuccess);
      const [file, imgs]: any = await Promise.all([getFile(), getImgs()]);
      console.log(file);
      // return;
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
  return (
    <div style={{ width: "100dvw", height: "100dvh", overflow: "hidden" }}>
      <ImgsDataCtx.Provider value={{ imgsData }}>
        {/* <Child num={3} /> */}
        {data && data.document.children.length > 0 && (
          <Pixi data={data.document.children[0]} imgsData={imgsData} />
        )}
        {/* <WebGL /> */}
        {/* <Three /> */}
        {/* {data && <Canvas data={data} imgsData={imgsData} />} */}
      </ImgsDataCtx.Provider>
    </div>
  );
};

export default Figma;

// const Child = ({ num }: { num: number }) => {
//   return (
//     <div>
//       NUM : {num}
//       {num > 0 ? <Child num={num - 1} /> : null}
//     </div>
//   );
// };
