import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';

export const EventCard = ({ event }) => {
  const occupancyRate = event.registeredCount / event.capacity;
  let progressColor = 'bg-success-500';
  if (occupancyRate > 0.9) progressColor = 'bg-danger-500';else
  if (occupancyRate > 0.7) progressColor = 'bg-warning-500';
  return (
    <Link to={`/events/${event.id || event._id}`} className="block h-full">
      <Card hoverable className="h-full flex flex-col group">
        {/* Image Header */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={event.image || event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            {event.isLive &&
            <Badge variant="danger" dot className="animate-pulse">
                LIVE NOW
              </Badge>
            }
            <Badge className="bg-white/90 backdrop-blur-sm text-slate-800 border-none shadow-sm">
              {event.category}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col p-5">
          {/* Title & Desc */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4 mt-auto">
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              {event.date}
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Clock className="w-4 h-4 mr-2 text-slate-400" />
              {event.time}
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Footer: Organizer & Capacity */}
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img
                  src={event.organizer.avatar}
                  alt={event.organizer.name}
                  className="w-6 h-6 rounded-full" />
                
                <span className="text-xs font-medium text-slate-700">
                  {event.organizer.name}
                </span>
              </div>
              <div className="flex items-center text-xs font-medium text-slate-600">
                <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {event.registeredCount} / {event.capacity}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
              <div
                className={`h-1.5 rounded-full ${progressColor}`}
                style={{
                  width: `${Math.min(occupancyRate * 100, 100)}%`
                }}>
              </div>
            </div>
            {occupancyRate > 0.9 &&
            <p className="text-[10px] text-danger-600 font-medium text-right">
                Almost full!
              </p>
            }
          </div>
        </CardContent>
      </Card>
    </Link>);

};
