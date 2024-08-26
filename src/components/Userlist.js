import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import 'primeicons/primeicons.css';

function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState("Clear filter");
  const [filterSelected, setFilterSelected] = useState(false);

  const [startDisplay, setStartDisplay] = useState(1);
  const [endDisplay, setEndDisplay] = useState(usersPerPage);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`https://randomuser.me/api/?results=${usersPerPage}&seed=foobar`);
        const { results } = res.data;
        setUsers(results);
        setFilteredUsers(results);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [usersPerPage]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users);
      setCurrentPage(1);
      setStartDisplay(1);
      setEndDisplay(usersPerPage);
    }
  }, [searchTerm, users, usersPerPage]);

  useEffect(() => {
    setFilter("Clear filter"); 
  }, []);

  const handleSearch = useCallback(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const results = users.filter(user => {
      switch (filter) {
        case "Name":
          return `${user.name.first} ${user.name.last}`.toLowerCase().includes(lowercasedSearchTerm);
        case "Email":
          return user.email.toLowerCase().includes(lowercasedSearchTerm);
        case "Phone":
          return user.phone.toLowerCase().includes(lowercasedSearchTerm);
        case "Location":
          return user.location.city.toLowerCase().includes(lowercasedSearchTerm) ||
                 user.location.country.toLowerCase().includes(lowercasedSearchTerm);
        case "Clear filter":
          return `${user.name.first} ${user.name.last}`.toLowerCase().includes(lowercasedSearchTerm) ||
                 user.email.toLowerCase().includes(lowercasedSearchTerm) ||
                 user.location.city.toLowerCase().includes(lowercasedSearchTerm) ||
                 user.location.country.toLowerCase().includes(lowercasedSearchTerm) ||
                 user.phone.toLowerCase().includes(lowercasedSearchTerm); 
        default:
          return true;
      }
    });

    setFilteredUsers(results);
    setCurrentPage(1);
    setStartDisplay(1);
    setEndDisplay(Math.min(usersPerPage, results.length));
  }, [searchTerm, users, filter, usersPerPage]);

  useEffect(() => {
    const debouncedSearch = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(debouncedSearch);
  }, [searchTerm, handleSearch]);

  const moveNextRange = () => {
    const totalUsers = filteredUsers.length;
    const newStart = endDisplay + 1;
    const newEnd = Math.min(newStart + usersPerPage - 1, totalUsers);

    if (newStart <= totalUsers) {
      setStartDisplay(newStart);
      setEndDisplay(newEnd);
      setCurrentPage(Math.ceil(newStart / usersPerPage));
    }
  };

  const movePrevRange = () => {
    const newEnd = startDisplay - 1;
    const newStart = Math.max(newEnd - usersPerPage + 1, 1);
    const updatedEndDisplay = Math.max(newEnd, usersPerPage);

    if (newStart > 0) {
      setStartDisplay(newStart);
      setEndDisplay(updatedEndDisplay);
      setCurrentPage(Math.ceil(newStart / usersPerPage));
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Dummy Users Table</h1>
        <div className="filter-search">
          <div className="search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
            />
          </div>
          <div className="custom-select" style={{ alignSelf: "center" }}>
            <select
              id="filter-options"
              value={filter}
              onChange={(e) => {
                const selectedFilter = e.target.value;
                if (selectedFilter === "Clear filter") {
                  setSearchTerm('');
                }
                setFilter(selectedFilter);
                setFilterSelected(true);
              }}
              style={{ height: "35px" }}
            >
              {!filterSelected && <option value="Clear filter" disabled hidden>Filter</option>}
              <option value="Clear filter">Clear Filter</option>
              <option value="Name">Name</option>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="Location">Location</option>
            </select>
          </div>
        </div>
      </div>
      <div style={{ maxHeight: "400px", overflow: "auto" }}>
        <table>
          <thead style={{ position: "sticky", top: "0px" }}>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(startDisplay - 1, endDisplay).map((user, index) => (
              <tr key={index}>
                <td>{user.name.first} {user.name.last}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.location.city}, {user.location.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <label htmlFor="rows-per-page">Rows per page: </label>
        <div>
          <select
            id="rows-per-page"
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(Number(e.target.value));
              setCurrentPage(1);
              setStartDisplay(1);
              setEndDisplay(Number(e.target.value));
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <p>{startDisplay} - {endDisplay} of {filteredUsers.length}</p>
        <i
          className={`pi pi-angle-left ${startDisplay === 1 ? 'disabled' : ''}`}
          onClick={movePrevRange}
          aria-disabled={startDisplay === 1}
        ></i>
        <i
          className={`pi pi-angle-right ${endDisplay >= filteredUsers.length ? 'disabled' : ''}`}
          onClick={moveNextRange}
          aria-disabled={endDisplay >= filteredUsers.length}
        ></i>
      </div>
    </div>
  );
}

export default App;