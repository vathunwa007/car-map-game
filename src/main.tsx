import ReactDOM from "react-dom/client";

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/PlayMap",
    element: <Play />,
  },
]);

function Main() {
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <Main />
  // </React.StrictMode>
);
