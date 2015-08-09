<?php

namespace App\Providers;

use App\Blackout;
use App\Blackoutevent;
use App\Meeting;

use DateTime;
use DateInterval;
use Mail;
use Swift_Attachment;
use Swift_Encoding;
use Swift_Mailer;
use Swift_Message;

use Illuminate\Support\ServiceProvider;
use Sabre\VObject\Component\VCalendar;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Blackout::saved(function ($blackout) {
            if($blackout->repeat_type == 1){ //daily
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
                $start = new DateTime($blackout->start);
                $end = new DateTime($blackout->end);
                $stop = new DateTime($blackout->repeat_until);
                $stop->setTime(23,59,59);
                $interval = new DateInterval("P" . $blackout->repeat_every . "D");
                while($start < $stop){
                    $blackoutevent = new Blackoutevent;
                    $blackoutevent->title = $blackout->title;
                    $blackoutevent->start = $start;
                    $blackoutevent->end = $end;
                    $blackoutevent->advisor_id = $blackout->advisor_id;
                    $blackoutevent->blackout_id = $blackout->id;
                    $blackoutevent->repeat = true;
                    $blackoutevent->save();
                    $start->add($interval);
                    $end->add($interval);
                }
            }else if ($blackout->repeat_type == 2){//weekly
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
                $start = new DateTime($blackout->start);
                $end = new DateTime($blackout->end);
                $stop = new DateTime($blackout->repeat_until);
                $stop->setTime(23,59,59);
                $interval = new DateInterval("P" . ($blackout->repeat_every - 1) . "W");
                $day = new DateInterval("P1D");
                while($start < $stop){
                    $dow = $start->format('w');
                    if(strpos($blackout->repeat_detail, $dow) !== FALSE){
                        $blackoutevent = new Blackoutevent;
                        $blackoutevent->title = $blackout->title;
                        $blackoutevent->start = $start;
                        $blackoutevent->end = $end;
                        $blackoutevent->advisor_id = $blackout->advisor_id;
                        $blackoutevent->blackout_id = $blackout->id;
                        $blackoutevent->repeat = true;
                        $blackoutevent->save();
                    }
                    if($dow == 6){
                        $start->add($interval);
                        $end->add($interval);
                    }
                    $start->add($day);
                    $end->add($day);
                }
            }else if ($blackout->repeat_type == 0){//no repeat
                Blackoutevent::where('blackout_id', $blackout->id)->delete();
                $blackoutevent = new Blackoutevent;
                $blackoutevent->title = $blackout->title;
                $blackoutevent->start = $blackout->start;
                $blackoutevent->end = $blackout->end;
                $blackoutevent->advisor_id = $blackout->advisor_id;
                $blackoutevent->blackout_id = $blackout->id;
                $blackoutevent->repeat = false;
                $blackoutevent->save();
            }
        });
        
        Meeting::created(function ($meeting) {
            $type = "created";
            $start = new DateTime($meeting->start);
            $end = new DateTime($meeting->end);

            $ical = "BEGIN:VCALENDAR\r
METHOD:REQUEST\r
PRODID:-//Microsoft Corporation//Outlook 11.0 MIMEDIR//EN\r
VERSION:2.0\r
BEGIN:VTIMEZONE\r
TZID:Central Standard Time\r
BEGIN:STANDARD\r
DTSTART:16010101T020000\r
TZOFFSETFROM:-0500\r
TZOFFSETTO:-0600\r
RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=1SU;BYMONTH=11\r
END:STANDARD\r
BEGIN:DAYLIGHT\r
DTSTART:16010101T020000\r
TZOFFSETFROM:-0600\r
TZOFFSETTO:-0500\r
RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=2SU;BYMONTH=3\r
END:DAYLIGHT\r
END:VTIMEZONE\r
BEGIN:VEVENT\r
ORGANIZER;CN=Russell Feldhausen:MAILTO:russfeld@ksu.edu\r
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=" . $meeting->advisor->name . ":MAILTO:" . $meeting->advisor->email . "\r
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=" . $meeting->student->name . ":MAILTO:" . $meeting->student->email . "\r
DESCRIPTION;LANGUAGE=en-US:" . $meeting->description . "\r
UID:" . $meeting->id . "-12345678901234567890-cis.ksu.edu\r
SUMMARY;LANGUAGE=en-US:" . $meeting->title . "\r
DTSTART;TZID=Central Standard Time:" . $start->format("Ymd\THis") . "\r
DTEND;TZID=Central Standard Time:" . $end->format("Ymd\THis") . "\r
CLASS:PUBLIC\r
PRIORITY:5\r
DTSTAMP:" . gmdate("Ymd\THis") ."Z\r
TRANSP:OPAQUE\r
STATUS:CONFIRMED\r
SEQUENCE:0\r
LOCATION;LANGUAGE=en-US:" . $meeting->advisor->office ."\r
BEGIN:VALARM\r
DESCRIPTION:REMINDER\r
TRIGGER;RELATED=START:-PT15M\r
ACTION:DISPLAY\r
END:VALARM\r
END:VEVENT\r
END:VCALENDAR\r";

// X-MICROSOFT-CDO-APPT-SEQUENCE:0\r\n
// X-MICROSOFT-CDO-OWNERAPPTID:715687903\r\n
// X-MICROSOFT-CDO-BUSYSTATUS:TENTATIVE\r\n
// X-MICROSOFT-CDO-INTENDEDSTATUS:BUSY\r\n
// X-MICROSOFT-CDO-ALLDAYEVENT:FALSE\r\n
// X-MICROSOFT-CDO-IMPORTANCE:1\r\n
// X-MICROSOFT-CDO-INSTTYPE:0\r\n
// X-MICROSOFT-DISALLOW-COUNTER:FALSE\r\n
        
            $messageObject = Swift_Message::newInstance();
            $messageObject->setContentType("multipart/alternative");
            $messageObject->getHeaders()->AddTextHeader('Content-class', 'urn:content-classes:calendarmessage');
            $messageObject->addPart("A meeting has been created!", "text/plain");

            $messageObject->setSubject("Advising meeting created")
              ->setFrom("russfeld@ksu.edu");

            $messageObject->setTo(array($meeting->advisor->email, $meeting->student->email));
            $ics_attachment = Swift_Attachment::newInstance()
              ->setBody(trim($ical))
              ->setEncoder(Swift_Encoding::get7BitEncoding())
              ->setDisposition('inline;filename=invite.ics');
            $headers = $ics_attachment->getHeaders();
            $content_type_header = $headers->get("Content-Type");
            $content_type_header->setValue("text/calendar");
            $content_type_header->setParameters(array(
              'charset' => 'UTF-8',
              'method' => 'REQUEST'
            ));
            //$headers->remove('Content-Disposition');
            $messageObject->attach($ics_attachment);

            $mailObject = Mail::getSwiftMailer();
            $mailObject->send($messageObject);

            
        });

        Meeting::updated(function ($meeting) {

        });

        Meeting::deleted(function ($meeting) {

        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
