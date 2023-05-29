import React from "react";

export default class SearchBar extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            "searchBarInput" : ""
        }
        this.searchBarInputChange = this.searchBarInputChange.bind(this);
        this.searchBarSubmit = this.searchBarSubmit.bind(this);
    }

    searchBarInputChange = (event) => {
        this.setState({
            "searchBarInput": event.target.value
        });
    };  

    searchBarSubmit = () => {
        // onClick function takes in search input, page number, direction (prev or next), page size, request location (search or table)
        this.props.onButtonClick(this.state.searchBarInput, 1, "next", this.props.pageSize, "search")
    };

    render() {
        return (
            <div className="flex justify-between w-full">
                <input
                    placeholder={this.props.placeholder}
                    value={this.state.searchBarInput} 
                    onChange={this.searchBarInputChange}
                    className="p-4 rounded-l-xl w-4/5 border-2 focus:outline-none 
                                    border-on-tertiary-container           bg-tertiary-container           text-on-tertiary-container           placeholder:text-on-tertiary-container
                               dark:border-on-tertiary-container-dark dark:bg-tertiary-container-dark dark:text-on-tertiary-container-dark dark:placeholder:text-on-tertiary-container-dark"
                />
                <button onClick={this.searchBarSubmit}
                        className="p-4 w-1/5 ml-4 rounded-r-xl cursor-pointer hover:shadow-md
                                        bg-tertiary           text-on-tertiary           hover:shadow-shadow
                                   dark:bg-tertiary-dark dark:text-on-tertiary-dark dark:hover:shadow-shadow-dark"
                >Search</button>
            </div>
        )
    }
}