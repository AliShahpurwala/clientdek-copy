//a component that gets all the journals of a client and returns them as a list
import apiHandler from "../../../utils/ApiHandler";

export default function clientJournals(client_id) {
    let page = 1;
    let clientJournals = [];
  
    function getJournals() {
      const url = `/events/journals/?client_id=${client_id}&page=${page}&page_size=10`;
  
      return apiHandler.get(url).then(response => {
        const journals = response.data;
  
        if (journals.length === 0) {
          return clientJournals;
        }
  
        clientJournals.push(...journals);
        page++;
        return getJournals();
      });
    }
  
    return getJournals();
  }
  