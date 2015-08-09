<?php

namespace App\Providers;

use App\Blackout;
use App\Blackoutevent;
use App\Meeting;

use DateTime;
use DateInterval;
use Mail;
use PHPMailer;

use Illuminate\Support\ServiceProvider;

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
            AppServiceProvider::sendMail($meeting, $type);
        });

        Meeting::updated(function ($meeting) {
            $type = "updated";
            AppServiceProvider::sendMail($meeting, $type);
        });

        Meeting::deleting(function ($meeting) {
            $type = "removed";
            AppServiceProvider::sendMail($meeting, $type);
        });
    }

    public static function sendMail($meeting, $type){
            $start = new DateTime($meeting->start);
            $end = new DateTime($meeting->end);

            $mail = new PHPMailer;

            //$mail->SMTPDebug = 3;                               // Enable verbose debug output

            $mail->isSMTP();                                      // Set mailer to use SMTP
            $mail->Host = env('MAIL_HOST', 'smtp.mailgun.org');  // Specify main and backup SMTP servers
            $mail->SMTPAuth = true;                               // Enable SMTP authentication
            $mail->Username = env('MAIL_USERNAME');                 // SMTP username
            $mail->Password = env('MAIL_PASSWORD');                           // SMTP password
            $mail->SMTPSecure = env('MAIL_ENCRYPTION', 'tls');                            // Enable TLS encryption, `ssl` also accepted
            $mail->Port = env('MAIL_PORT', 587);                                    // TCP port to connect to

            $mail->From = 'russfeldh@gmail.com';
            $mail->FromName = 'Russell Feldhausen';
            $mail->addAddress("Russell Feldhausen", "russfeldh@gmail.com");     // Add a recipient
            $mail->addAddress($meeting->advisor->email, $meeting->advisor->name);               // Name is optional
            $mail->addReplyTo('russfeldh@gmail.com', 'Russell Feldhausen');
            
            //Convert MYSQL datetime and construct iCal start, end and issue dates
            $meetingstart = strtotime($meeting->start);    
            $dtstart= gmdate("Ymd\THis\Z",$meetingstart);
            $meetingend = strtotime($meeting->end); 
            $dtend= gmdate("Ymd\THis\Z",$meetingend);
            $todaystamp = gmdate("Ymd\THis\Z");
            
            //Create unique identifier
            $cal_uid = $meeting->id ."-123123123123123-@ksu.edu";
            
            //Create Mime Boundry
            $mime_boundary = "----Meeting Booking----".md5(time());
                
            //Create Email Headers
            $mail->ContentType = "multipart/alternative; boundary=".$mime_boundary;
            $mail->addCustomHeader("Content-class: urn:content-classes:calendarmessage");
            
            //Create Email Body (Text)
            $message = "--$mime_boundary\n";
            $message .= "Content-Type: text/plain; charset=UTF-8\n";
            $message .= "Content-Transfer-Encoding: 8bit\n\n";
            
            $message .= view('email.meetingtext')->with('meeting', $meeting)->with('type', $type);
            $message .= "\n";

            //Create Email Body (HTML)
            $message = "--$mime_boundary\n";
            $message .= "Content-Type: text/html; charset=UTF-8\n";
            $message .= "Content-Transfer-Encoding: 8bit\n\n";
            
            $message .= view('email.meeting')->with('meeting', $meeting)->with('type', $type);
            $message .= "\n";

            $message .= "--$mime_boundary\n";
        
            if($type != "removed"){    
            //Create ICAL Content (Google rfc 2445 for details and examples of usage) 
                $ical =    'BEGIN:VCALENDAR
PRODID:-//Microsoft Corporation//Outlook 11.0 MIMEDIR//EN
VERSION:2.0
METHOD:REQUEST
BEGIN:VEVENT
ORGANIZER;CN=Russell Feldhausen:MAILTO:russfeldh@gmail.com
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN='.$meeting->advisor->email.':MAILTO:'.$meeting->advisor->email.'
DTSTART:'.$dtstart.'
DTEND:'.$dtend.'
LOCATION:'.$meeting->advisor->office.'
TRANSP:OPAQUE
SEQUENCE:'.$meeting->sequence.'
UID:'.$cal_uid.'
DTSTAMP:'.$todaystamp.'
DESCRIPTION:'.$meeting->description.'
SUMMARY:'.$meeting->title.'
END:VEVENT
END:VCALENDAR';   
    
                $message .= "Content-Type: text/calendar;name=\"meeting.ics\";method=REQUEST;charset=utf-8\n";
                $message .= "Content-Transfer-Encoding: 8bit\n\n";
                $message .= $ical; 
            }else{
                //Create ICAL Content (Google rfc 2445 for details and examples of usage) 
                $ical =    'BEGIN:VCALENDAR
PRODID:-//Microsoft Corporation//Outlook 11.0 MIMEDIR//EN
VERSION:2.0
METHOD:CANCEL
BEGIN:VEVENT
ORGANIZER;CN=Russell Feldhausen:MAILTO:russfeldh@gmail.com
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN='.$meeting->advisor->email.':MAILTO:'.$meeting->advisor->email.'
DTSTART:'.$dtstart.'
DTEND:'.$dtend.'
LOCATION:'.$meeting->advisor->office.'
TRANSP:OPAQUE
SEQUENCE:'.$meeting->sequence.'
UID:'.$cal_uid.'
DTSTAMP:'.$todaystamp.'
DESCRIPTION:'.$meeting->description.'
SUMMARY:'.$meeting->title.'
STATUS:CANCELLED
END:VEVENT
END:VCALENDAR';   
    
                $message .= "Content-Type: text/calendar;name=\"meeting.ics\";method=CANCEL;charset=utf-8\n";
                $message .= "Content-Transfer-Encoding: 8bit\n\n";
                $message .= $ical;
            }
            


            $mail->Subject = "Advising - " . $meeting->title;
            $mail->Body = $message;

            if(!$mail->send()) {
                echo 'Message could not be sent.';
            } 
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
