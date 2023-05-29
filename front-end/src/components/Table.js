import React, { useState, useEffect } from "react";
import { formatAPIKey } from "../utils/ClientdekUtils";
import PrimaryButton from "./buttons/PrimaryButton";
// import PreviousArrow from "./PreviousArrow";
// import NextArrow from "./NextArrow";

export default function Table(props) {

    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [queryPageRange, setQueryPageRange] = useState([-2, 2]);
    const [currentSearch, setCurrentSearch] = useState(props.currentSearch);
    const [tableReset, setTableReset] = useState(props.reset);

    if (props.currentSearch !== currentSearch) {
        setCurrentSearch(props.currentSearch);
        setCurrentPageNumber(1);
    } else if (tableReset === true) {
        setCurrentPageNumber(1);
        setQueryPageRange([-2, 2]);
        setTableReset(false);
    }

    useEffect(() => {setTableReset(props.reset)}, [props.reset]);

    return (
        <div>
            <table className="table-auto w-full shadow-sm ">
                <thead className="border-2 text-xl text-left
                                       border-outline           bg-surface-80
                                  dark:border-outline-dark dark:bg-surface-dark">
                    <tr className="table-row">
                        {props.headers.map(header =>
                            <th key={header} className="p-2 text-surface-20 dark:text-on-surface-variant-dark">
                                {formatAPIKey(header)}
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="cursor-pointer">
                    {(props.entries.slice((props.numRows * ((currentPageNumber - (props.queryRows/props.numRows)*props.offset) - 1 )),
                                        ((currentPageNumber - (props.queryRows/props.numRows)*props.offset) * props.numRows))).map((row, i) => {
                        return (
                            <tr key={i} onClick={props.rowClick}
                                className={'table-row border-2 \
                                                 border-outline      bg-secondary-container           text-on-secondary-container           hover:bg-primary-container\
                                            dark:border-outline-dark dark:bg-secondary-container-dark dark:text-on-secondary-container-dark dark:hover:bg-primary-container-dark'}>
                                {props.headers.map((header, j) => {
                                    if (row[header] === null) {
                                        return (
                                            <td key={j} id={row[props.identifier]} className={'table-cell p-2'}>N/A</td>
                                        )
                                    } else {
                                        return (
                                            <td key={j} id={row[props.identifier]} className={'table-cell p-2'}>{row[header]}</td>
                                        )
                                    }
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {props.buttonShow ?
                <div className="mt-3 flex items-center w-1/4 float-right">
                    <PrimaryButton enabled = {currentPageNumber!==1} 
                                    text="Previous"
                                    onClick={
                                        (props.offset !== 0 && props.numRows * currentPageNumber <= (props.queryRows * queryPageRange[0] + 1) + 3*props.numRows) ?
                                        () => {props.getData(currentSearch, queryPageRange[0], "prev", props.queryRows, "table");
                                                setCurrentPageNumber(currentPageNumber - 1);
                                                setQueryPageRange([queryPageRange[0] - 1, queryPageRange[1] - 1])} :
                                        () => {setCurrentPageNumber(currentPageNumber - 1)}
                                    }
                     />
                    <p className="w-1/6 text-center mx-2 text-lg text-on-surface dark:text-on-surface-dark">{currentPageNumber}</p>
                    <PrimaryButton enabled = {((currentPageNumber - (props.queryRows/props.numRows)*props.offset) * props.numRows >= props.entries.length+(props.offset*props.queryRows)) ? false : true}
                                    text="Next"
                                    onClick={
                                        (props.numRows * currentPageNumber >= (props.queryRows * (queryPageRange[1] - 1)) - 3*props.numRows) ?
                                        () => {props.getData(currentSearch, queryPageRange[1], "next", props.queryRows, "table");
                                                setCurrentPageNumber(currentPageNumber + 1);
                                                setQueryPageRange([queryPageRange[0] + 1, queryPageRange[1] + 1])} :
                                        () => {setCurrentPageNumber(currentPageNumber + 1)}
                                    }
                        />
                </div>
            : null}
        </div>
    )
}