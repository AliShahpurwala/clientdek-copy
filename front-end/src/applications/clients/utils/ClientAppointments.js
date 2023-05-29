
import apiHandler from "../../../utils/ApiHandler";

export default function clientAppointments(client_id) {
    let page = 1;
    let clientAppointments = [];
  
    function getAppointments() {
      const url = `/events/appointments/?client_id=${client_id}&page=${page}&page_size=10`;
  
      return apiHandler.get(url).then(response => {
        const appointments = response.data;
  
        if (appointments.length === 0) {
          return clientAppointments;
        }
  
        clientAppointments.push(...appointments);
        page++;
        return getAppointments();
      });
    }
    return getAppointments();
  }
  