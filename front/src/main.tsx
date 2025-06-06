import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.tsx";
import { SearchProvider } from "./context/SearchContext.tsx";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const client = new ApolloClient({
  // uri: "https://back-asocial.onrender.com",
  uri: "https://asocial-production.up.railway.app/",
  // uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SearchProvider>
        <ApolloProvider client={client}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ApolloProvider>
      </SearchProvider>
    </AuthProvider>
  </StrictMode>
);
