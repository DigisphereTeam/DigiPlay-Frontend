import { useMemo } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";

import "./FormField.css";

const FormField = ({
  label,
  name,
  type = "text",
  multiple,
  value,
  onChange,
  options = [],
  rows = 3,
  placeholder = "",
  required = false,
  disabled = false,
  accept,
}) => {
  const selectOptions = useMemo(
    () =>
      options.map((option) => ({
        label: option.label ?? option,
        value: option.value ?? option,
      })),
    [options],
  );

  return (
    <Form.Group className="ui-form-field-wrapper mb-3">
      {label && (
        <Form.Label className="ui-form-field-label">
          {label}
          {required && <span className="ui-form-field-required">*</span>}
        </Form.Label>
      )}

      {type === "search-select" ? (
        <Select
          options={selectOptions}
          value={selectOptions.find((option) => option.value === value) || null}
          onChange={(selected) =>
            onChange({
              target: {
                name,
                value: selected ? selected.value : "",
              },
            })
          }
          placeholder={placeholder || `Search ${label}`}
          isSearchable
          isDisabled={disabled}
          noOptionsMessage={() => `No ${label} found`}
          classNamePrefix="ui-search-select"
          menuPlacement="auto"
        />
      ) : type === "select" ? (
        <Form.Select
          className="ui-form-field-control"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </Form.Select>
      ) : type === "file" ? (
        <Form.Control
          className="ui-form-field-control"
          type="file"
          name={name}
          multiple={multiple}
          onChange={onChange}
          required={required}
          disabled={disabled}
          accept={accept}
        />
      ) : (
        <Form.Control
          className="ui-form-field-control"
          as={type === "textarea" ? "textarea" : "input"}
          rows={type === "textarea" ? rows : undefined}
          type={type !== "textarea" ? type : undefined}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}
    </Form.Group>
  );
};

export default FormField;
