import { useState, useMemo } from 'react'
import meetupData from './meetup_data_golang-mel.json'
import './App.css'

// Extract topics from event details
function extractTopics(details) {
    if (!details) return []
    
    const text = details.toLowerCase()
    const topics = []
    
    // Common tech keywords and topics
    const keywordMap = {
      'kubernetes': 'Kubernetes',
      'k8s': 'Kubernetes',
      'opentelemetry': 'OpenTelemetry',
      'observability': 'Observability',
      'monitoring': 'Monitoring',
      'api': 'APIs',
      'apis': 'APIs',
      'rest': 'REST',
      'graphql': 'GraphQL',
      'grpc': 'gRPC',
      'protobuf': 'Protobuf',
      'microservices': 'Microservices',
      'microservice': 'Microservices',
      'testing': 'Testing',
      'tdd': 'TDD',
      'unit testing': 'Testing',
      'integration testing': 'Testing',
      'test': 'Testing',
      'ai': 'AI',
      'artificial intelligence': 'AI',
      'machine learning': 'Machine Learning',
      'ml': 'Machine Learning',
      'llm': 'LLM',
      'language model': 'LLM',
      'langchain': 'LangChain',
      'docker': 'Docker',
      'container': 'Containers',
      'containers': 'Containers',
      'cloud': 'Cloud',
      'aws': 'AWS',
      'azure': 'Azure',
      'gcp': 'GCP',
      'google cloud': 'GCP',
      'database': 'Database',
      'sql': 'SQL',
      'nosql': 'NoSQL',
      'postgresql': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'redis': 'Redis',
      'event-driven': 'Event-Driven',
      'eda': 'Event-Driven Architecture',
      'event-driven architecture': 'Event-Driven Architecture',
      'temporal': 'Temporal',
      'orchestration': 'Orchestration',
      'choreography': 'Choreography',
      'concurrency': 'Concurrency',
      'goroutines': 'Concurrency',
      'goroutine': 'Concurrency',
      'channels': 'Concurrency',
      'performance': 'Performance',
      'optimization': 'Optimization',
      'security': 'Security',
      'authentication': 'Authentication',
      'authorization': 'Authorization',
      'web development': 'Web Development',
      'web framework': 'Web Development',
      'http': 'Web Development',
      'server': 'Server',
      'backend': 'Backend',
      'frontend': 'Frontend',
      'react': 'Frontend',
      'plugin': 'Plugins',
      'plugins': 'Plugins',
      'open source': 'Open Source',
      'opensource': 'Open Source',
      'ci/cd': 'CI/CD',
      'cicd': 'CI/CD',
      'continuous integration': 'CI/CD',
      'devops': 'DevOps',
      'deployment': 'Deployment',
      'networking': 'Networking',
      'tcp': 'Networking',
      'http/2': 'Networking',
      'websocket': 'WebSockets',
      'websockets': 'WebSockets',
      'json': 'JSON',
      'yaml': 'YAML',
      'configuration': 'Configuration',
      'logging': 'Logging',
      'error handling': 'Error Handling',
      'errors': 'Error Handling',
      'type system': 'Type System',
      'interfaces': 'Interfaces',
      'generics': 'Generics',
      'modules': 'Modules',
      'package management': 'Package Management',
      'go modules': 'Package Management'
    }
    
    // Check for each keyword
    Object.entries(keywordMap).forEach(([keyword, topic]) => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(text)) {
        if (!topics.includes(topic)) {
          topics.push(topic)
        }
      }
    })
    
    return topics
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedView, setSelectedView] = useState('timeline')
  const [sortOrder, setSortOrder] = useState('date-desc')
  const [daysFilter, setDaysFilter] = useState('')

  // Process events data
  const processedEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate day calculation
    
    return meetupData.past_events
      .map(event => {
        const date = event.datetime ? new Date(event.datetime) : null
        let daysAgo = null
        if (date) {
          const eventDate = new Date(date)
          eventDate.setHours(0, 0, 0, 0)
          const diffTime = today - eventDate
          daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        }
        return {
          ...event,
          date,
          daysAgo,
          year: date ? date.getFullYear() : null,
          month: date ? date.getMonth() : null,
          monthName: date ? date.toLocaleString('default', { month: 'short' }) : null,
          yearMonth: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : null
        }
      })
      .filter(event => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          const matchesSearch = (
            event.title.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower) ||
            event.details.toLowerCase().includes(searchLower)
          )
          if (!matchesSearch) return false
        }
        
        // Days filter
        if (daysFilter !== '' && daysFilter !== null) {
          const daysValue = parseInt(daysFilter, 10)
          if (!isNaN(daysValue) && daysValue >= 0) {
            // Filter events that occurred more than the specified number of days ago
            if (event.daysAgo === null || event.daysAgo <= daysValue) {
              return false
            }
          }
        }
        
        return true
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
  }, [searchTerm, sortOrder, daysFilter])

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

  // Calculate topic insights
  const topicInsights = useMemo(() => {
    const topicData = {}
    const topicTimeline = {}
    
    processedEvents.forEach(event => {
      const topics = extractTopics(event.details)
      const yearMonth = event.yearMonth || 'unknown'
      
      topics.forEach(topic => {
        // Topic frequency and popularity
        if (!topicData[topic]) {
          topicData[topic] = {
            count: 0,
            totalAttendees: 0,
            events: []
          }
        }
        topicData[topic].count++
        topicData[topic].totalAttendees += event.attendee_count || 0
        topicData[topic].events.push({
          title: event.title,
          date: event.date,
          attendees: event.attendee_count || 0,
          yearMonth
        })
        
        // Topic timeline
        if (!topicTimeline[topic]) {
          topicTimeline[topic] = {}
        }
        if (!topicTimeline[topic][yearMonth]) {
          topicTimeline[topic][yearMonth] = {
            count: 0,
            totalAttendees: 0
          }
        }
        topicTimeline[topic][yearMonth].count++
        topicTimeline[topic][yearMonth].totalAttendees += event.attendee_count || 0
      })
    })
    
    // Calculate average attendees per topic
    const topicsWithStats = Object.entries(topicData).map(([topic, data]) => ({
      topic,
      count: data.count,
      totalAttendees: data.totalAttendees,
      avgAttendees: Math.round(data.totalAttendees / data.count),
      events: data.events
    }))
    
    // Most common topics (by frequency)
    const mostCommon = [...topicsWithStats]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    // Most popular topics (by average attendees)
    const mostPopular = [...topicsWithStats]
      .filter(t => t.count >= 2) // Only topics that appeared in at least 2 events
      .sort((a, b) => b.avgAttendees - a.avgAttendees)
      .slice(0, 10)
    
    return {
      topicData,
      topicTimeline,
      mostCommon,
      mostPopular,
      allTopics: topicsWithStats
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

  // Render most common topics
  const renderMostCommonTopics = () => {
    if (topicInsights.mostCommon.length === 0) {
      return (
        <div className="chart-container">
          <h3>Most Common Topics</h3>
          <p>No topic data available</p>
        </div>
      )
    }

    const maxCount = Math.max(...topicInsights.mostCommon.map(t => t.count), 1)

    return (
      <div className="chart-container">
        <h3>Most Common Topics</h3>
        <p className="chart-description">Topics mentioned most frequently across all events</p>
        <div className="topics-list">
          {topicInsights.mostCommon.map((topic, index) => {
            const barWidth = (topic.count / maxCount) * 100
            return (
              <div key={topic.topic} className="topic-item">
                <div className="topic-header">
                  <span className="topic-name">{topic.topic}</span>
                  <span className="topic-count">{topic.count} events</span>
                </div>
                <div className="topic-bar-container">
                  <div
                    className="topic-bar"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: `hsl(${220 + (index * 30) % 60}, 70%, 50%)`
                    }}
                  />
                </div>
                <div className="topic-stats">
                  <span>{topic.totalAttendees} total attendees</span>
                  <span>•</span>
                  <span>Avg: {topic.avgAttendees} attendees/event</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render most popular topics
  const renderMostPopularTopics = () => {
    if (topicInsights.mostPopular.length === 0) {
      return (
        <div className="chart-container">
          <h3>Most Popular Topics</h3>
          <p>No topic data available</p>
        </div>
      )
    }

    const maxAvg = Math.max(...topicInsights.mostPopular.map(t => t.avgAttendees), 1)

    return (
      <div className="chart-container">
        <h3>Most Popular Topics</h3>
        <p className="chart-description">Topics with highest average attendee count (minimum 2 events)</p>
        <div className="topics-list">
          {topicInsights.mostPopular.map((topic, index) => {
            const barWidth = (topic.avgAttendees / maxAvg) * 100
            return (
              <div key={topic.topic} className="topic-item">
                <div className="topic-header">
                  <span className="topic-name">{topic.topic}</span>
                  <span className="topic-count">Avg: {topic.avgAttendees} attendees</span>
                </div>
                <div className="topic-bar-container">
                  <div
                    className="topic-bar"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: `hsl(${120 + (index * 30) % 60}, 70%, 50%)`
                    }}
                  />
                </div>
                <div className="topic-stats">
                  <span>{topic.count} events</span>
                  <span>•</span>
                  <span>{topic.totalAttendees} total attendees</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render topic trends over time
  const renderTopicTrends = () => {
    // Get top 5 most common topics for trend analysis
    const topTopics = topicInsights.mostCommon.slice(0, 5)
    
    if (topTopics.length === 0) {
      return (
        <div className="chart-container">
          <h3>Topic Trends Over Time</h3>
          <p>No topic data available</p>
        </div>
      )
    }

    // Get all unique year-months from events
    const allYearMonths = [...new Set(
      processedEvents
        .filter(e => e.yearMonth)
        .map(e => e.yearMonth)
        .sort()
    )].slice(-12) // Last 12 months

    return (
      <div className="chart-container">
        <h3>Topic Trends Over Time</h3>
        <p className="chart-description">Frequency of top 5 topics over the last 12 months</p>
        <div className="topic-trends-chart">
          <div className="topic-trends-legend">
            {topTopics.map((topic, index) => (
              <div key={topic.topic} className="trend-legend-item">
                <div
                  className="trend-legend-color"
                  style={{
                    backgroundColor: `hsl(${index * 72}, 70%, 50%)`
                  }}
                />
                <span>{topic.topic}</span>
              </div>
            ))}
          </div>
          <div className="topic-trends-bars">
            {allYearMonths.map(yearMonth => {
              const maxCount = Math.max(
                ...topTopics.map(topic => 
                  topicInsights.topicTimeline[topic.topic]?.[yearMonth]?.count || 0
                ),
                1
              )
              
              return (
                <div key={yearMonth} className="trend-month-group">
                  <div className="trend-bars-container">
                    {topTopics.map((topic, index) => {
                      const count = topicInsights.topicTimeline[topic.topic]?.[yearMonth]?.count || 0
                      const height = maxCount > 0 ? (count / maxCount) * 150 : 0
                      
                      return (
                        <div
                          key={`${yearMonth}-${topic.topic}`}
                          className="trend-bar"
                          style={{
                            height: `${height}px`,
                            backgroundColor: `hsl(${index * 72}, 70%, 50%)`,
                            width: `${100 / topTopics.length}%`
                          }}
                          title={`${topic.topic}: ${count} event(s)`}
                        />
                      )
                    })}
                  </div>
                  <span className="trend-month-label">{yearMonth}</span>
                </div>
              )
            })}
          </div>
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
        <div className="filter-controls">
          <div className="days-filter">
            <label htmlFor="days-filter">Greater than:</label>
            <input
              id="days-filter"
              type="number"
              min="0"
              step="1"
              placeholder="Days"
              value={daysFilter}
              onChange={(e) => {
                const value = e.target.value
                // Allow empty string or non-negative integers
                if (value === '') {
                  setDaysFilter('')
                } else {
                  const numValue = parseInt(value, 10)
                  if (!isNaN(numValue) && numValue >= 0) {
                    setDaysFilter(value)
                  }
                }
              }}
              onBlur={(e) => {
                // Clean up on blur - remove invalid values
                const value = e.target.value
                if (value !== '' && (isNaN(parseInt(value, 10)) || parseInt(value, 10) < 0)) {
                  setDaysFilter('')
                }
              }}
              className="days-input"
            />
            <span className="days-label">days ago</span>
          </div>
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
            
            {/* Topic Insights */}
            {renderMostCommonTopics()}
            {renderMostPopularTopics()}
            {renderTopicTrends()}
            
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
