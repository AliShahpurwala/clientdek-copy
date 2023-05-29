// import DatePiccker from mui
import { DatePicker } from "@mui/x-date-pickers";

//render date picker as function component
export default function ClientdekDatePicker(props)
{
    return (
        <DatePicker
            value={props.selectedDate}
            onChange={props.handleDateChange}
        />
    );
}