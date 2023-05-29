// import DatePiccker from mui
import { TimePicker } from "@mui/x-date-pickers";

//render date picker as function component
export default function ClientdekTimePicker(props)
{
    return (
        <TimePicker
            value={props.selectedTime}
            onChange={props.handleTimeChange}
        />
    );
}