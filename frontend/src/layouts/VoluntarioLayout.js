import { Outlet } from "react-router-dom";



export default function VoluntarioLayout() {


  return (
    <div className="main-panel">
      <div className="sticky-top">
        Cabeçalho
      </div>
      <div className="content">
        <Outlet />
      </div>
      footer
    </div>
  );
}

