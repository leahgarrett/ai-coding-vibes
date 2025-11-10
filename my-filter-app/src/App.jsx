import { useState, useMemo } from 'react'
import meetupData from './meetup_data_golang-mel.json'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedView, setSelectedView] = useState('timeline')
  const [sortOrder, setSortOrder] = useState('date-desc')

  // Process events data
  const processedEvents = useMemo(() => {
    return meetupData.past_events
      .map(event => {
        const date = event.datetime ? new Date(event.datetime) : null
        return {
          ...event,
          date,
          year: date ? date.getFullYear() : null,
          month: date ? date.getMonth() : null,
          monthName: date ? date.toLocaleString('default', { month: 'short' }) : null,
          yearMonth: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : null
        }
      })
      .filter(event => {
        if (!searchTerm) return true
        const searchLower = searchTerm.toLowerCase()
        return (
          event.title.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.details.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => {
        if (sortOrder === 'date-desc') {
          if (!a.date) return 1
          if (!b.date) return -1
          return b.date - a.date
        } else if (sortOrder === 'date-asc') {
          if (!a.date) return 1
          if (!b.date) return -1
          return a.date - b.date
        } else if (sortOrder === 'attendees-desc') {
          return b.attendee_count - a.attendee_count
        } else if (sortOrder === 'attendees-asc') {
          return a.attendee_count - b.attendee_count
        }
        return 0
      })
  }, [searchTerm, sortOrder])

  // Calculate statistics
  const stats = useMemo(() => {
    const eventsWithDates = processedEvents.filter(e => e.date)
    const attendeeCounts = processedEvents.map(e => e.attendee_count).filter(c => c > 0)
    const totalAttendees = attendeeCounts.reduce((sum, count) => sum + count, 0)
    const avgAttendees = attendeeCounts.length > 0 ? Math.round(totalAttendees / attendeeCounts.length) : 0
    const maxAttendees = Math.max(...attendeeCounts, 0)
    const minAttendees = Math.min(...attendeeCounts, 0)
    
    // Group by year-month
    const monthlyData = {}
    eventsWithDates.forEach(event => {
      if (event.yearMonth) {
        if (!monthlyData[event.yearMonth]) {
          monthlyData[event.yearMonth] = { count: 0, attendees: 0 }
        }
        monthlyData[event.yearMonth].count++
        monthlyData[event.yearMonth].attendees += event.attendee_count
      }
    })

    // Group by location
    const locationData = {}
    processedEvents.forEach(event => {
      const location = event.location || 'Unknown'
      if (!locationData[location]) {
        locationData[location] = { count: 0, attendees: 0 }
      }
      locationData[location].count++
      locationData[location].attendees += event.attendee_count
    })

    return {
      totalEvents: processedEvents.length,
      totalAttendees,
      avgAttendees,
      maxAttendees,
      minAttendees,
      monthlyData,
      locationData
    }
  }, [processedEvents])

  // Get chart data for attendee trends
  const chartData = useMemo(() => {
    const eventsWithDates = processedEvents
      .filter(e => e.date && e.attendee_count > 0)
      .slice()
      .sort((a, b) => a.date - b.date)
    
    return eventsWithDates.map(event => ({
      date: event.date,
      label: event.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      attendees: event.attendee_count,
      title: event.title
    }))
  }, [processedEvents])

  // Render bar chart
  const renderBarChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="chart-container">
          <h3>Attendee Count Over Time</h3>
          <p>No data available</p>
        </div>
      )
    }

    const maxAttendees = Math.max(...chartData.map(d => d.attendees), 1)
    const chartHeight = 300
    // Calculate bar width: minimum 4px, maximum 20px, or auto-adjust based on data length
    const estimatedWidth = chartData.length > 50 
      ? Math.max(4, Math.floor(800 / chartData.length))
      : Math.min(20, Math.max(8, Math.floor(600 / chartData.length)))
    const barWidth = estimatedWidth
    const labelInterval = Math.max(1, Math.floor(chartData.length / 12))

    return (
      <div className="chart-container">
        <h3>Attendee Count Over Time</h3>
        <div className="bar-chart" style={{ height: `${chartHeight}px` }}>
          {chartData.map((data, index) => {
            const barHeight = (data.attendees / maxAttendees) * (chartHeight - 50)
            return (
              <div
                key={index}
                className="bar-wrapper"
                style={{ width: `${barWidth}px` }}
                title={`${data.label}: ${data.attendees} attendees\n${data.title}`}
              >
                <div
                  className="bar"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: `hsl(${220 + (data.attendees / maxAttendees) * 60}, 70%, 50%)`
                  }}
                />
                {index % labelInterval === 0 && (
                  <span className="bar-value">{data.attendees}</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="chart-labels">
          {chartData.filter((_, i) => i % labelInterval === 0).map((data, i) => (
            <span key={i} className="chart-label">{data.label}</span>
          ))}
        </div>
      </div>
    )
  }

  // Render monthly distribution
  const renderMonthlyDistribution = () => {
    const monthlyEntries = Object.entries(stats.monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 months

    const maxCount = Math.max(...monthlyEntries.map(([_, data]) => data.count), 1)

    return (
      <div className="chart-container">
        <h3>Events per Month (Last 12 Months)</h3>
        <div className="monthly-chart">
          {monthlyEntries.map(([month, data]) => {
            const barHeight = (data.count / maxCount) * 200
            return (
              <div key={month} className="monthly-bar-wrapper">
                <div className="monthly-bar-container">
                  <div
                    className="monthly-bar"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: '#646cff'
                    }}
                  />
                  <span className="monthly-bar-value">{data.count}</span>
                </div>
                <span className="monthly-label">{month}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 {meetupData.group_name} - Data Visualization</h1>
        <p className="subtitle">{meetupData.full_about}</p>
      </header>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalAttendees.toLocaleString()}</div>
          <div className="stat-label">Total Attendees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgAttendees}</div>
          <div className="stat-label">Avg Attendees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.maxAttendees}</div>
          <div className="stat-label">Max Attendees</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{meetupData.past_events_count}</div>
          <div className="stat-label">Past Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{meetupData.upcoming_events_count}</div>
          <div className="stat-label">Upcoming Events</div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search events by title, location, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="attendees-desc">Attendees (Most First)</option>
            <option value="attendees-asc">Attendees (Least First)</option>
          </select>
        </div>
        <div className="view-controls">
          <button
            className={selectedView === 'timeline' ? 'active' : ''}
            onClick={() => setSelectedView('timeline')}
          >
            Timeline
          </button>
          <button
            className={selectedView === 'charts' ? 'active' : ''}
            onClick={() => setSelectedView('charts')}
          >
            Charts
          </button>
          <button
            className={selectedView === 'list' ? 'active' : ''}
            onClick={() => setSelectedView('list')}
          >
            List
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {selectedView === 'timeline' && (
          <div className="timeline-view">
            <h2>Event Timeline</h2>
            <div className="timeline">
              {processedEvents.slice(0, 20).map((event, index) => (
                <div key={event.event_id || index} className="timeline-item">
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className="event-date">
                        {event.date
                          ? event.date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Date TBD'}
                      </span>
                    </div>
                    <div className="event-details">
                      <p className="event-location">📍 {event.location || 'Location TBD'}</p>
                      <p className="event-attendees">👥 {event.attendee_count} attendees</p>
                      {event.url && (
                        <a href={event.url} target="_blank" rel="noopener noreferrer" className="event-link">
                          View on Meetup →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedView === 'charts' && (
          <div className="charts-view">
            {renderBarChart()}
            {renderMonthlyDistribution()}
            
            {/* Top Locations */}
            <div className="locations-section">
              <h3>Top Locations</h3>
              <div className="locations-list">
                {Object.entries(stats.locationData)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 10)
                  .map(([location, data]) => (
                    <div key={location} className="location-item">
                      <div className="location-name">{location}</div>
                      <div className="location-stats">
                        <span>{data.count} events</span>
                        <span>•</span>
                        <span>{data.attendees} total attendees</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'list' && (
          <div className="list-view">
            <h2>All Events ({processedEvents.length})</h2>
            <div className="events-list">
              {processedEvents.map((event, index) => (
                <div key={event.event_id || index} className="event-card">
                  <div className="event-card-header">
                    <h3>{event.title}</h3>
                    <div className="event-badge">{event.attendee_count} attendees</div>
                  </div>
                  <div className="event-card-body">
                    <p className="event-meta">
                      <span>📅 {event.date ? event.date.toLocaleDateString() : 'Date TBD'}</span>
                      <span>📍 {event.location || 'Location TBD'}</span>
                    </p>
                    <p className="event-description">
                      {event.details.substring(0, 200)}...
                    </p>
                    {event.url && (
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="event-link">
                        View Event →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
