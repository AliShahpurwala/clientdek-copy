import React, { useState, useEffect, useRef } from "react";
import apiHandler from "../utils/ApiHandler";
import { useSnackBarContext } from "./SnackBarProvider";
import { MdAddCircle, MdOutlineClose } from "react-icons/md";

export default function MultiSelect({ apiSubPath, placeholder, handleChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { showSnackBar } = useSnackBarContext();
  const wrapperRef = useRef(null);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResults([]);
        return;
      }

      apiHandler
        .get(`${apiSubPath}${query}`)
        .then((response) => {
            if (response.data.status_code === 204) {
                setShowDropdown(false);
                return;
            }
            const responseValue = response.data;
            setResults(responseValue.slice(0, 3));
            setShowDropdown(true);
            return;
        })
        .catch((error) => {
          if (error.response && error.response.status === 400) {
            showSnackBar("Please enter a valid search query", "ERROR");
          } else {
            console.error(error);
            // handle other errors here
          }
        });
    }

    fetchResults();
  }, [apiSubPath, query, showSnackBar]);

  function handleQueryChange(event) {
    setQuery(event.target.value);
  }

  function addSelectedClient(client) {
    var newSelectedSet = [...selected, client];
    setSelected(newSelectedSet);
    handleChange(newSelectedSet);
  }

  function removeSelectedClient(client) {
    const updatedSelectedClients = selected.filter(
      (selectedClient) => selectedClient.client_id !== client.client_id
    );
    setSelected(updatedSelectedClients);
    handleChange(updatedSelectedClients);
  }

  function handleClickOutside(event) {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex flex-wrap">
        {selected.map((result) => {
            const idKey = Object.keys(result).filter(key => key.includes("_id"))[0];
            const firstKey = Object.keys(result).filter(key => key.includes("first"))[0];
            const lastKey = Object.keys(result).filter(key => key.includes("last"))[0];
            return(
                <div
                    key={result[idKey]}
                    className="border border-outline dark:border-outline-dark rounded-lg p-1 m-1 flex items-center"
                >
                    <span className="mr-2 text-on-surface dark:text-on-surface-dark">
                    {result[firstKey]} {result[lastKey]}
                    </span>
                    <button onClick={() => removeSelectedClient(result)}>
                        <MdOutlineClose className="text-error dark:text-error-dark m-2"/>
                    </button>
                </div>
            )
        })}
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder={placeholder}
          className="border rounded-lg p-2 w-full
                    border-outline-variant           bg-white           text-on-surface           outline-outline
                    dark:border-outline-variant-dark dark:bg-surface-40 dark:text-on-surface-dark dark:outline-outline-dark"
        />

        {showDropdown && (
          <div className="absolute top-full left-0 w-full max-w-xs border rounded-lg shadow-md z-10
                        border-outline-variant           bg-white           text-on-surface           outline-outline
                        dark:border-outline-variant-dark dark:bg-surface-40 dark:text-on-surface-dark dark:outline-outline-dark">
          <ul>
            {results.map((result) => {
                const idKey = Object.keys(result).filter(key => key.includes("_id"))[0];
                const firstKey = Object.keys(result).filter(key => key.includes("first"))[0];
                const lastKey = Object.keys(result).filter(key => key.includes("last"))[0];
                return(
                    <li key={result[idKey]} className="flex justify-between m-1 w-full">
                        <p>{result[firstKey]} {result[lastKey]}</p>
                        <button
                            onClick={() => addSelectedClient(result)}
                        ><MdAddCircle className="text-primary-container dark:text-primary-container-dark m-2" /></button>
                    </li>
                )
                })}
          </ul>
        </div>
        )}
      </div>
    </div>
  );
}