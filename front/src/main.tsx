import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.tsx";
import { SearchProvider } from "./context/SearchContext.tsx";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const httpLink = createHttpLink({
  // uri: "https://back-asocial.onrender.com/graphql",
  uri: import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql",
  // uri: "https://c114d9f0b947.ngrok-free.app/graphql",
  // uri: "https://asocial-back-dockerhub-252574921374.europe-west1.run.app/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
