import React, { Component } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Utils } from "../utils";
import { toast } from "react-toastify";
import { Tag } from "primereact/tag";

export class RequestInfo extends Component {
  constructor(props) {
    super(props);
    this.state = { ...props };
  }

  updateDimensions = () => {
    this.setState(this.state);
  };
  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  convertUTCDateToLocalDate(date) {
    var utcSeconds = date;
    var d = new Date(0);
    d.setUTCSeconds(utcSeconds);
    return d;
  }

  isDesktop() {
    return window.innerWidth > 768;
  }

  encodePathWithSlashes(path) {
    // Split the path by forward slashes
    const segments = path.split("/");

    // Encode each segment individually
    const encodedSegments = segments.map((segment) =>
      segment ? encodeURIComponent(segment) : "",
    );

    // Join segments back with slashes
    return encodedSegments.join("/");
  }

  shareRequest = () => {
    const id = this.props.request._id;
    const subdomain = this.props.request.uid;

    const data = btoa(JSON.stringify({ id, subdomain }));

    const url = `${window.location.origin}/?request=${data}`;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success(
          "Request share link copied to clipboard",
          Utils.toastOptions,
        );
      })
      .catch(() => {
        toast.error(
          "Failed to copy request share link to clipboard",
          Utils.toastOptions,
        );
      });
  };

  render() {
    let request = this.props.request;
    const isShared = this.props.isShared || false;
    let data = request.raw ? Utils.base64Decode(request.raw) : "";

    let headerKeys;
    if (request.headers) headerKeys = Object.keys(request.headers);

    if (request.name === undefined) {
      data =
        request.method +
        " " +
        this.encodePathWithSlashes(request.path) +
        request.query +
        request.fragment +
        " " +
        request.protocol.replace("HTTPS", "HTTP") +
        "\r\n";
      data += "host: " + request.headers["host"] + "\r\n";
      headerKeys.map((item) => {
        if (item !== "host") {
          data += item + ": " + request.headers[item] + "\r\n";
        }
        return 1;
      });
      data += "\r\n";
      if (request.raw) {
        data += Utils.base64Decode(request.raw) + "\r\n";
      }
    }

    let out;

    if (request.name === undefined) {
      out = (
        <div className="grid">
          <div className="col-12">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "0.5em",
              }}
            >
              <h1 style={{ margin: "0" }}>Request Details</h1>
              {isShared && <Tag value="Shared" severity="info" />}
              <Button
                icon="pi pi-share-alt"
                className="p-button-text p-button-secondary theme-toggle"
                style={{ width: "2rem", height: "2rem", borderRadius: "50%" }}
                onClick={this.shareRequest}
                tooltip="Share request details"
              />
            </div>
            <table className="req-table">
              <tbody>
                <tr>
                  <td className="req-table-a">Request Type</td>
                  <td>
                    <span
                      style={{ position: "static" }}
                      className="count other"
                    >
                      {request.protocol}
                    </span>
                    <span
                      style={{ position: "static" }}
                      className={"count " + request.method.toLowerCase()}
                    >
                      {request.method}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="req-table-a">URL</td>
                  <td className="req-table-b">
                    <a href={request.url}>{request.url}</a>
                  </td>
                </tr>
                <tr>
                  <td className="req-table-a">Sender</td>
                  <td className="req-table-b">
                    {request.ip}:{request.port}
                  </td>
                </tr>
                {request.country && (
                  <tr>
                    <td className="req-table-a">Country</td>
                    <td className="req-table-b">
                      <span
                        className={"fi fi-" + request.country.toLowerCase()}
                      ></span>{" "}
                      {request.country} (
                      <a href="https://db-ip.com">IP Geolocation by DB-IP</a>)
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="req-table-a">Date</td>
                  <td className="req-table-b">
                    {this.convertUTCDateToLocalDate(
                      request.date,
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="req-table-a">Path</td>
                  <td className="req-table-b">{request.path}</td>
                </tr>
                <tr>
                  <td className="req-table-a">Query string</td>
                  <td className="req-table-b">{request.query}</td>
                </tr>
                <tr>
                  <td className="req-table-a">Fragment</td>
                  <td className="req-table-b">{request.fragment}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-12">
            <h1>Headers</h1>
            <table className="req-table">
              <tbody>
                {headerKeys.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="req-table-a">{item}</td>
                      <td className="req-table-b">{request.headers[item]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="col-12">
            <h1>Query Parameters</h1>
            {request.query ? (
              <table className="req-table">
                {request.query
                  .substring(1)
                  .split("&")
                  .map((dict, index) => {
                    let q = dict.split("=");
                    return (
                      <tr key={index}>
                        <td className="req-table-a">{q[0]}</td>
                        <td className="req-table-b">{q[1]}</td>
                      </tr>
                    );
                  })}
              </table>
            ) : (
              <p>(empty)</p>
            )}
          </div>
          <div className="col-12">
            <h1>Form Data</h1>
            {request.raw ? (
              <div>
                <InputText
                  type="text"
                  style={{ width: "100%" }}
                  value={request.raw}
                />
                <br />
                <pre style={{ maxHeight: "400px", overflowY: "scroll" }}>
                  {Utils.base64Decode(request.raw)}
                </pre>
              </div>
            ) : (
              <p>(empty)</p>
            )}
          </div>
          <div className="col-12 raw-req">
            <h1>Raw request</h1>
            <InputText
              type="text"
              style={{ width: "100%" }}
              value={Utils.base64Encode(data)}
            />
            <br />
            <pre style={{ overflowWrap: "break-word", padding: "10px" }}>
              {data}
            </pre>
          </div>
        </div>
      );
    } else {
      out = (
        <div className="grid">
          <div className="col-12">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "0.5em",
              }}
            >
              <h1 style={{ margin: "0" }}>Request Details</h1>
              {isShared && <Tag value="Shared" severity="info" />}
              <Button
                icon="pi pi-share-alt"
                className="p-button-text p-button-secondary theme-toggle"
                style={{ width: "2rem", height: "2rem", borderRadius: "50%" }}
                onClick={this.shareRequest}
                tooltip="Share request details"
              />
            </div>
            <table className="req-table">
              <tbody>
                <tr>
                  <td className="req-table-a">Request Type</td>
                  <td>
                    <span style={{ position: "static" }} className="count dns">
                      DNS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="req-table-a">Hostname</td>
                  <td className="req-table-b">{request.name}</td>
                </tr>
                <tr>
                  <td className="req-table-a">Sender</td>
                  <td className="req-table-b">
                    {request.ip}:{request.port}
                  </td>
                </tr>
                {request.country && (
                  <tr>
                    <td className="req-table-a">Country</td>
                    <td className="req-table-b">
                      <span
                        className={"fi fi-" + request.country.toLowerCase()}
                      ></span>{" "}
                      {request.country} (
                      <a href="https://db-ip.com">IP Geolocation by DB-IP</a>)
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="req-table-a">Date</td>
                  <td className="req-table-b">
                    {this.convertUTCDateToLocalDate(
                      request.date,
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="req-table-a">Type</td>
                  <td className="req-table-b">{request.dtype}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-12">
            <h1>Reply</h1>
            <pre style={{ overflowWrap: "break-word" }}>{request.reply}</pre>
          </div>
          <div className="col-12 raw-req">
            <h1>Raw request</h1>
            <InputText
              type="text"
              style={{ width: "100%" }}
              value={request.raw}
            />
            <br />
            <pre style={{ overflowWrap: "break-word", padding: "10px" }}>
              {data}
            </pre>
          </div>
        </div>
      );
    }

    return <div>{out}</div>;
  }
}
