import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

// Mock ticket type
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'pending';
  user_id: string;
  created_at: string;
  updated_at: string;
  messages: {
    id: string;
    text: string;
    sender: 'user' | 'support';
    created_at: string;
  }[];
}

// Mock tickets data
const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Payment issue with apartment',
    description: 'I made a payment but it\'s not showing in my account.',
    status: 'open',
    user_id: 'user123',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      {
        id: 'm1',
        text: 'I made a payment yesterday, but it\'s not showing in my account history. Can you help me track it?',
        sender: 'user',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'm2',
        text: 'Thank you for contacting support. We\'ll look into this issue and get back to you within 24 hours.',
        sender: 'support',
        created_at: new Date(Date.now() - 76400000).toISOString()
      }
    ]
  },
  {
    id: '2',
    title: 'How to extend my lease?',
    description: 'I would like to extend my current lease.',
    status: 'closed',
    user_id: 'user123',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    messages: [
      {
        id: 'm3',
        text: 'My current lease is ending next month. What is the process to extend it for another year?',
        sender: 'user',
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'm4',
        text: 'To extend your lease, please go to the Leases page, find your current lease, and click on the "Extend Lease" button. You\'ll need to agree to new terms and possibly negotiate with your landlord.',
        sender: 'support',
        created_at: new Date(Date.now() - 162800000).toISOString()
      },
      {
        id: 'm5',
        text: 'Thank you! I found the option and started the process.',
        sender: 'user',
        created_at: new Date(Date.now() - 152800000).toISOString()
      },
      {
        id: 'm6',
        text: 'Great! Let us know if you need any further assistance. We\'re closing this ticket, but feel free to reopen it if needed.',
        sender: 'support',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  }
];

// Format date helper function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

type SupportProps = {
  isNewTicket?: boolean;
};

const Support: React.FC<SupportProps> = ({ isNewTicket = false }) => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: ''
  });
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'new'>(
    isNewTicket ? 'new' : id ? 'detail' : 'list'
  );

  // Fetch tickets (mock implementation)
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll just use our mock data
    setTickets(mockTickets);
  }, []);

  // Handle ticket selection
  useEffect(() => {
    if (id) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        setSelectedTicket(ticket);
        setCurrentView('detail');
      } else {
        navigate('/support');
      }
    } else if (isNewTicket) {
      setCurrentView('new');
    } else {
      setCurrentView('list');
    }
  }, [id, tickets, isNewTicket, navigate]);

  // Handle new message submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;

    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        const updatedTicket = {
          ...ticket,
          updated_at: new Date().toISOString(),
          messages: [
            ...ticket.messages,
            {
              id: `m${Date.now()}`,
              text: newMessage,
              sender: 'user' as const,
              created_at: new Date().toISOString()
            }
          ]
        };
        setSelectedTicket(updatedTicket);
        return updatedTicket;
      }
      return ticket;
    });

    setTickets(updatedTickets);
    setNewMessage('');
  };

  // Handle new ticket submission
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title.trim() || !newTicket.description.trim()) return;

    const newTicketObj: Ticket = {
      id: `ticket${Date.now()}`,
      title: newTicket.title,
      description: newTicket.description,
      status: 'open',
      user_id: currentUser?.id ? String(currentUser.id) : 'user123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: `m${Date.now()}`,
          text: newTicket.description,
          sender: 'user',
          created_at: new Date().toISOString()
        }
      ]
    };

    setTickets([newTicketObj, ...tickets]);
    setNewTicket({ title: '', description: '' });
    navigate(`/support/${newTicketObj.id}`);
  };

  // Render the tickets list
  const renderTicketsList = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Support Tickets</h1>
        <button
          onClick={() => navigate('/support/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
          New Ticket
        </button>
      </div>

      <div className="px-6 py-4">
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/support/${ticket.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 h-3 w-3 rounded-full ${
                      ticket.status === 'open' 
                        ? 'bg-emerald-500' 
                        : ticket.status === 'pending' 
                          ? 'bg-amber-500' 
                          : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <h3 className="text-md font-medium text-gray-900">{ticket.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{ticket.description}</p>
                      <div className="flex items-center mt-2">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {formatDate(ticket.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    ticket.status === 'open' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : ticket.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No support tickets</h3>
            <p className="mt-1 text-sm text-gray-500">Get help by creating a new support ticket.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/support/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Create New Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render ticket detail view
  const renderTicketDetail = () => {
    if (!selectedTicket) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center">
          <button
            onClick={() => navigate('/support')}
            className="mr-4 text-gray-400 hover:text-gray-500"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{selectedTicket.title}</h1>
            <div className="flex items-center mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mr-2 ${
                selectedTicket.status === 'open' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : selectedTicket.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500">
                Created on {formatDate(selectedTicket.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto">
          {selectedTicket.messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-emerald-50 text-gray-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formatDate(message.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedTicket.status !== 'closed' && (
          <div className="px-6 py-4 border-t border-gray-100">
            <form onSubmit={handleSendMessage}>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  // Render new ticket form
  const renderNewTicketForm = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center">
        <button
          onClick={() => navigate('/support')}
          className="mr-4 text-gray-400 hover:text-gray-500"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Create New Support Ticket</h1>
      </div>

      <div className="px-6 py-4">
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={newTicket.title}
              onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
              placeholder="Brief summary of your issue"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              rows={5}
              value={newTicket.description}
              onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
              placeholder="Provide details about your issue or question"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              required
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newTicket.title.trim() || !newTicket.description.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentView === 'list' && renderTicketsList()}
      {currentView === 'detail' && renderTicketDetail()}
      {currentView === 'new' && renderNewTicketForm()}
    </div>
  );
};

export default Support; 