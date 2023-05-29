import React, { useEffect, useState } from "react";
import InputText from "../../../components/inputs/InputText";
import InputDate from "../../../components/inputs/InputDate";
import {
  MdAddCircleOutline,
  MdRemoveCircleOutline,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import {
  PopupHeading2,
  PopupHeading3,
  PopupText,
} from "../../../components/text/PopupText";

const emptyClientForm = {
    name: {
      prefix: "",
      first: "",
      preferred: "",
      middle: "",
      last: "",
      suffix: "",
    },
    contact: {
      email: [
        {
          type: "",
          email: "",
          contact_preference: "",
        },
      ],
      phone: [
        {
          type: "",
          country_code: "",
          phone: "",
          contact_preference: "",
        },
      ],
    },
    address:
      {
        building_name: "",
        street_number: "",
        street_number_suffix: "",
        street_name: "",
        street_type: "",
        street_direction: "",
        address_type: "",
        address_type_identifier: "",
        local_municipality: "",
        city: "",
        governing_district: "",
        postal_code: "",
        country: "",
      },
    demographics: {
      gender: "",
      date_of_birth: "",
    },
  };

const EditableClient = ({ onChange, initialData = emptyClientForm }) => {
  const [clientData, setClientData] = useState(initialData);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    onChange(clientData);
    }, [clientData, onChange]);

  const addContactItem = (contactType) => {
    setClientData({
      ...clientData,
      contact: {
        ...clientData.contact,
        [contactType]: [
          ...clientData.contact[contactType],
          {
            type: "",
            [contactType === "phone" ? "phone" : "email"]: "",
            contact_preference: "",
            ...(contactType === "phone" ? { country_code: "" } : {}),
          },
        ],
      },
    });
  };

  const removeContactItem = (contactType, index) => {
    setClientData({
      ...clientData,
      contact: {
        ...clientData.contact,
        [contactType]: clientData.contact[contactType].filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  const handleChange = (section, subsection, index, event) => {
    const { name, value } = event.target;
    if (subsection) {
      setClientData((prevState) => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [subsection]: prevState[section][subsection].map((item, i) =>
            i === index ? { ...item, [name]: value } : item
          ),
        },
      }));
    } else {
      if (index !== null) {
        setClientData((prevState) => ({
          ...prevState,
          [section]: prevState[section].map((item, i) =>
            i === index ? { ...item, [name]: value } : item
          ),
        }));
      } else {
        setClientData({
          ...clientData,
          [section]: { ...clientData[section], [name]: value },
        });
      }
    }
  };



  return (
    <>
    <div className="px-6 rounded-lg overflow-auto max-h-screen">
      <section className="my-4 flex space-x-16">
        <div>
          {/* Name section */}
          <section className="my-4">
            <PopupHeading2>Name</PopupHeading2>
            <div>
              {showMore && (
                <InputText
                  name="prefix"
                  type="text"
                  value={clientData.name.prefix}
                  placeholder="Prefix"
                  onChange={
                      (event) => {
                    handleChange("name", null, null, event);
                  }}
                />
              )}
              <InputText
                name="first"
                type="text"
                value={clientData.name.first}
                placeholder="First name"
                onChange={
                  (event) => {
                      handleChange("name", null, null, event);
                      }
                }
              />
              {showMore && (
                <>
                  <InputText
                    name="preferred"
                    type="text"
                    value={clientData.name.preferred}
                    placeholder="Preferred name"
                    onChange={
                      (event) => {
                          handleChange("name", null, null, event);
                          }

                    }
                  />
                  <InputText
                    name="middle"
                    type="text"
                    value={clientData.name.middle}
                    placeholder="Middle name"
                    onChange={
                      (event) => {
                          handleChange("name", null, null, event);
                          }
                    }
                  />
                </>
              )}
              <InputText
                name="last"
                type="text"
                value={clientData.name.last}
                placeholder="Last name"
                onChange={
                  (event) => {
                      handleChange("name", null, null, event);
                      }
                }
              />
              {showMore && (
                <InputText
                  name="suffix"
                  type="text"
                  value={clientData.name.suffix}
                  placeholder="Suffix"
                  onChange={
                      (event) => {
                      handleChange("name", null, null, event);
                      }
                  }
                />
              )}
            </div>
          </section>
          {/* Contact section */}
          <section className="my-4">
            <PopupHeading2>Contact</PopupHeading2>
            <div>
              {/* Phone sub-section */}
              <PopupHeading3>Phone</PopupHeading3>
              {clientData.contact.phone.map((phone, index) => (
                <div key={index} className="relative mb-4">
                  <InputText
                    name="phone"
                    type="text"
                    value={phone.phone}
                    placeholder="Phone Number"
                    onChange={(event) =>
                      handleChange("contact", "phone", index, event)
                    }
                  />
                  <InputText
                    name="type"
                    type="text"
                    value={phone.type}
                    placeholder="Phone Type"
                    onChange={(event) =>
                      handleChange("contact", "phone", index, event)
                    }
                  />
                  {showMore && (
                    <>
                      <InputText
                        name="country_code"
                        type="text"
                        value={phone.country_code}
                        placeholder="Country Code"
                        onChange={(event) =>
                          handleChange("contact", "phone", index, event)
                        }
                      />

                      <InputText
                        name="contact_preference"
                        type="text"
                        value={phone.contact_preference}
                        placeholder="Contact Preference"
                        onChange={(event) =>
                          handleChange("contact", "phone", index, event)
                        }
                      />
                    </>
                  )}
                  {/* Delete button for additional phone entries */}
                  {index > 0 && (
                    <button
                      className="absolute top-4 -right-5"
                      onClick={() => removeContactItem("phone", index)}
                    >
                      <PopupText>
                        <MdRemoveCircleOutline />
                      </PopupText>
                    </button>
                  )}
                </div>
              ))}
              {/* Add button for additional phone entries if there are fewer than 3*/}
              {clientData.contact.phone.length < 3 && (
                <button
                  className="mt-2 -translate-y-4"
                  onClick={() => addContactItem("phone")}
                >
                  <PopupText>
                    <MdAddCircleOutline />
                  </PopupText>
                </button>
              )}
            </div>
            <div>
              {/* Email sub-section */}
              <PopupHeading3>Email</PopupHeading3>
              {clientData.contact.email.map((email, index) => (
                <div key={index} className="relative mb-4">
                  <InputText
                    name="type"
                    type="text"
                    value={email.type}
                    placeholder="Email Type"
                    onChange={(event) =>
                      handleChange("contact", "email", index, event)
                    }
                  />
                  <InputText
                    name="email"
                    type="email"
                    value={email.email}
                    placeholder="Email"
                    onChange={(event) =>
                      handleChange("contact", "email", index, event)
                    }
                  />
                  {showMore && (
                    <>
                      <InputText
                        name="contact_preference"
                        type="text"
                        value={email.contact_preference}
                        placeholder="Contact Preference"
                        onChange={(event) =>
                          handleChange("contact", "email", index, event)
                        }
                      />
                    </>
                  )}

                  {/* Delete button for additional email entries */}
                  {index > 0 && (
                    <button
                      className="absolute top-4 -right-5"
                      onClick={() => removeContactItem("email", index)}
                    >
                      <PopupText>
                        <MdRemoveCircleOutline />
                      </PopupText>
                    </button>
                  )}
                </div>
              ))}
              {/* Add button for additional email entries if there are fewer than 3*/}
              {clientData.contact.email.length < 3 && (
                <button
                  className="mt-2 -translate-y-4"
                  onClick={() => addContactItem("email")}
                >
                  <PopupText>
                    <MdAddCircleOutline />
                  </PopupText>
                </button>
              )}
            </div>
          </section>
        </div>
        <section>
          {/* Address section */}
          <section className="my-4">
            <PopupHeading2>Address</PopupHeading2>
            <div>
              <InputText
                name="street_number"
                type="text"
                value={clientData.address.street_number}
                placeholder="Street number"
                onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
              />
              {showMore && (
                <InputText
                  name="street_number_suffix"
                  type="text"
                  value={clientData.address.street_number_suffix}
                  placeholder="Street number suffix"
                  onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
                />
              )}
              <InputText
                name="street_name"
                type="text"
                value={clientData.address.street_name}
                placeholder="Street name"
                onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
              />
              <InputText
                name="street_type"
                type="text"
                value={clientData.address.street_type}
                placeholder="Street type"
                onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
              />
              {showMore && (
                <>
                  <InputText
                    name="street_direction"
                    type="text"
                    value={clientData.address.street_direction}
                    placeholder="Street direction"
                    onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
                  />
                  <InputText
                    name="building_name"
                    type="text"
                    value={clientData.address.building_name}
                    placeholder="Building name"
                    onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
                  />
                </>
              )}
              <InputText
                name="address_type"
                type="text"
                value={clientData.address.address_type}
                placeholder="Type (eg. Suite, Apt.)"
                onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
              />
              <InputText
                name="address_type_identifier"
                type="text"
                value={clientData.address.address_type_identifier}
                placeholder="Unit #"
                onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
              />
              <InputText
                name="city"
                type="text"
                value={clientData.address.city}
                placeholder="City"
                onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
              />
              <InputText
                name="governing_district"
                type="text"
                value={clientData.address.governing_district}
                placeholder="Province"
                onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
              />
              {showMore && (
                <>
                  <InputText
                    name="local_municipality"
                    type="text"
                    value={clientData.address.local_municipality}
                    placeholder="Local municipality"
                    onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
                  />
                  <InputText
                    name="postal_code"
                    type="text"
                    value={clientData.address.postal_code}
                    placeholder="Postal code"
                    onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
                  />
                  <InputText
                    name="country"
                    type="text"
                    value={clientData.address.country}
                    placeholder="Country"
                    onChange={
                  (event) => {
                      handleChange("address", null, null, event);
                      }
                }
                  />
                </>
              )}
            </div>
          </section>
          {/* Demographics section */}
          <section className="my-4">
            <PopupHeading2>Demographics</PopupHeading2>
            <InputText
              name="gender"
              type="text"
              value={clientData.demographics.gender}
              placeholder="Gender"
              onChange={(event) =>
                handleChange("demographics", null, null, event)
              }
            />
            <InputDate
              name="date_of_birth"
              value={clientData.demographics.date_of_birth}
              placeholder="Date of Birth"
              onChange={(event) =>
                handleChange("demographics", null, null, event)
              }
            />
          </section>
        </section>
      </section>
    </div>

    <PopupText>
      <button className="mt-2" onClick={() => setShowMore(!showMore)}>
        {showMore ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      </button>
      Show {showMore ? "Less" : "More"}
    </PopupText>
  </>
  );
};

export default EditableClient;
