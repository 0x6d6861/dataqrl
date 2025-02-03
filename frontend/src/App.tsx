import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import FilesPage from "@/pages/files";
import FileDetailsPage from "@/pages/files/[id]";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<FilesPage />} path="/uploads" />
      <Route element={<FileDetailsPage />} path="/uploads/:id" />
    </Routes>
  );
}

export default App;
