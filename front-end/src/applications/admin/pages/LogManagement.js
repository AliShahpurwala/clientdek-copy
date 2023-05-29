import { useState, useEffect, useCallback, useRef } from "react";
import SearchBar from "../../../components/SearchBar";
import Table from "../../../components/Table";
import apiHandler from "../../../utils/ApiHandler";

export default function LogManagementPage() {

    const [logList, setLogList] = useState([]);

    const [logTableShow, setLogTableShow] = useState(false);
    const [logTableReset, setLogTableReset] = useState(false);

    const logSearchPageSize = 100;
    const [currentQuery, setCurrentQuery] = useState(null);
    const [offset, setOffset] = useState(0);

    const searchLogs = useCallback(async (query, page, direction, pageSize, requestLoc) => {
        var responseValue;
        var response;
        setCurrentQuery(query);
    
        try {
            if (query === "") {
                response = await apiHandler.get(`/admin/logs?page=${page}&page_size=${pageSize}`);
            } else {
                response = await apiHandler.get(`/admin/logs?user_id=${query}&page=${page}&page_size=${pageSize}`);
            }
            responseValue = response.data;
    
            responseValue.map((logEvent) => {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var logTimeStr = logEvent.log_time;
                var dateObj = new Date(logTimeStr);
                logEvent.log_time = `${dateObj.toLocaleDateString('en-US', options)} ${dateObj.toLocaleTimeString('en-US')}`;
                return logEvent;
            });
    
            if (responseValue.length > 0) {
                if (requestLoc === "search") {
                    setLogList(responseValue);
                    setOffset(0);
                    setLogTableReset(true);
                } else if (logList.length > 2*pageSize) {
                    if (direction === "next") {
                        setLogList((logList.slice(pageSize)).concat(responseValue));
                        setOffset(offset + 1);
                    } else if (direction === "prev") {
                        setLogList(responseValue.concat(logList.slice(0, -pageSize)));
                        setOffset(offset - 1);
                    }
                } else if (direction === "next") {
                        setLogList(logList.concat(responseValue));
                }
                setLogTableShow(true);
            }
        } catch (error) {
            console.error(error);
            // handle error here
        }
    }, [logList, offset]);
    

    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            searchLogs("", 1, "next", logSearchPageSize, "search");
            isMounted.current = true;
            return;
        }
    }, [logSearchPageSize, searchLogs]);

    return (
        <>
            <div className="mb-3">
                <SearchBar onButtonClick={searchLogs} placeholder={"Search Logs"} pageSize={logSearchPageSize}/>
            </div>
            <div>  
                {logTableShow ?
                    <Table
                        entries={logList}
                        headers={["log_id", "user_id", "description", "location", "milliseconds_taken", "http_method", "log_time"]}
                        rowClick={() => {}}
                        identifier="log_id"
                        buttonShow={true}
                        numRows={10}
                        queryRows={logSearchPageSize}
                        queryPage={1}
                        currentSearch={currentQuery}
                        offset={offset}
                        getData={searchLogs}
                        reset={logTableReset}
                    /> : null}
            </div>
        </>
    )
}