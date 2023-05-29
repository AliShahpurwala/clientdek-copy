import React from "react";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdCake,
} from "react-icons/md";
import {
  PopupHeading2,
  PopupHeading3,
  PopupText,
} from "../../../components/text/PopupText";
import EventsDiv from "./DisplayClientDivs/EventsDiv";

export default function DisplayClient({
  clientDetails,
  appointmentDetails,
  journalDetails,
  client_id,
}) {
    const formattedAddress = () => {
        const address = clientDetails.address;
        if (!address) return null;
    
        const parts = [
          address.building_name && `${address.building_name}, `,
          `${address.street_number || ""}${address.street_number_suffix || ""} `,
          address.street_name,
          address.street_type && ` ${address.street_type}`,
          address.street_direction && ` ${address.street_direction}`,
          (address.local_municipality ||
            address.city ||
            address.governing_district ||
            address.postal_code) &&
            `\n`,
          address.local_municipality && `${address.local_municipality}, `,
          address.city && `${address.city}, `,
          address.governing_district && `${address.governing_district}, `,
          address.postal_code && `${address.postal_code}`,
          address.country && `\n${address.country}`,
        ];
    
        return parts
          .filter((part) => part)
          .join("")
          .trim()
          .replace(/  +/g, " ");
      };
    
      const formattedPhoneNumber = (number, country_code) => {
        const str_num = `${number}`;
        const str_country_code = `${country_code}`;
        let formatted_number = str_num;
        if (str_num.length === 10) {
          formatted_number = `(${str_num.slice(0, 3)}) ${str_num.slice(
            3,
            6
          )}-${str_num.slice(6, 10)}`;
        }
        if (country_code) {
          formatted_number = `+${str_country_code} ${formatted_number}`;
        }
        return formatted_number;
      };

  return (
<div className="flex flex-col overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            <div>
              { clientDetails.contact &&
                clientDetails.contact.email &&
                clientDetails.contact.email.some((email) => email.email) && (
                  <>
                    <PopupHeading2>
                      <MdEmail className="inline mr-2" />
                      Email
                    </PopupHeading2>
                    {clientDetails.contact.email.map(
                      (email, index) =>
                        email.email && (
                          <div key={index}>
                            <PopupHeading3>{email.type || ""}</PopupHeading3>
                            <PopupText>{email.email || ""}</PopupText>
                          </div>
                        )
                    )}
                  </>
                )}
              { clientDetails.contact &&
                clientDetails.contact.phone &&
                clientDetails.contact.phone.some((phone) => phone.phone) && (
                  <div
                    className={
                      clientDetails.contact.email &&
                      clientDetails.contact.email.some((email) => email.email)
                        ? "mt-8"
                        : ""
                    }
                  >
                    <PopupHeading2>
                      <MdPhone className="inline mr-2" />
                      Phone
                    </PopupHeading2>
                    {clientDetails.contact.phone.map(
                      (phone, index) =>
                        phone.phone && (
                          <div key={index}>
                            <PopupHeading3>{phone.type || ""}</PopupHeading3>
                            <PopupText>
                              {formattedPhoneNumber(
                                phone.phone,
                                phone.country_code
                              )}
                            </PopupText>
                          </div>
                        )
                    )}
                  </div>
                )}
            </div>
            <div>
              {formattedAddress() && (
                <>
                  <PopupHeading2>
                    <MdLocationOn className="inline mr-2" />
                    Address
                  </PopupHeading2>
                  <PopupText>{formattedAddress()}</PopupText>
                </>
              )}
              { clientDetails.demographics &&
              (clientDetails.demographics.gender || clientDetails.demographics.date_of_birth) && (
                <div className="mt-8">
                  <PopupHeading2>
                    <MdCake className="inline mr-2" />
                    Demographics
                  </PopupHeading2>
                  <div className="flex space-x-8">
                    {clientDetails.demographics.gender && (
                      <>
                        <div>
                          <PopupHeading3>Gender</PopupHeading3>
                          <PopupText>{clientDetails.demographics.gender}</PopupText>
                        </div>
                      </>
                    )}
                    {clientDetails.demographics.date_of_birth && (
                      <>
                        <div>
                          <PopupHeading3>Date of Birth</PopupHeading3>
                          <PopupText>{clientDetails.demographics.date_of_birth}</PopupText>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="max-h-full mt-8 flex-grow flex flex-col overflow-hidden">
            <EventsDiv
              client_id={client_id}
              appointmentDetails={appointmentDetails}
              journalDetails={journalDetails}
            />
          </div>
        </div>
  );
}
