/**
 * SharePoint Branding Calendar
 *
 * - Dependencies: 
 *    - Knockout
 *    - jQuery
 *    - jquery.glDatePicker
 *    - jquery.SPServices
 *    - moment
 *    - sp.js (SharePoint) 
 */

'use strict';


import { CalendarViewModel, SPServicesJsonQuery } from './classes.ts';


const calendarVM: CalendarViewModel = new CalendarViewModel();

jQuery(document).ready(function(): void {

    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', getEventsByServiceQuery);
    ko.applyBindings(calendarVM, document.getElementById('calendar-info'));
});




/**
 * Function: getEventsByServiceQuery()
 *
 * - Uses the jQuery.SPServices library to retrive the events
 *   contained within a sharepoint calendar.
 */

function getEventsByServiceQuery(): void {

    'use strict';

    // This is a trick to retrieve recurring events.
    // It will not pull dates before today but this 
    // is required for retrieving recurring events:
    let camlQuery: string = 
        "<Query>"
            + "<Where>"
                + "<DateRangesOverlap>"
                    + "<FieldRef Name='EventDate' />"
                    + "<FieldRef Name='EndDate' />"
                    + "<Value Type='DateTime'>"
                        + "<Now />"
                    + "</Value>"
                + "</DateRangesOverlap>"
            + "</Where>"
            + "<OrderBy>"
                + "<FieldRef Name='EventDate' Ascending='True' />"
            + "</OrderBy>"
        + "</Query>"
    ;

    let camlViewFields: string =         
        "<ViewFields>"
            + "<FieldRef Name='ID' />"
            + "<FieldRef Name='Title' />"
            + "<FieldRef Name='Category' />"
            + "<FieldRef Name='Description' />"
            + "<FieldRef Name='EventDate' />"
            + "<FieldRef Name='EndDate' />"
            + "<FieldRef Name='FileRef' />"
            + "<FieldRef Name='fRecurrence' />"
            + "<FieldRef Name='fAllDayEvent' />"
        + "</ViewFields>"
    ;

    let camlQueryOptions: string =
        "<QueryOptions>"
            + "<RecurrencePatternXMLVersion>v3</RecurrencePatternXMLVersion>"
            + "<ExpandRecurrence>TRUE</ExpandRecurrence>"
        + "</QueryOptions>"
    ;

    let eventQuery: SPServicesJsonQuery = new SPServicesJsonQuery({
        listName: 'Events',
        CAMLQuery: camlQuery,
        CAMLViewFields: camlViewFields,
        CAMLQueryOptions: camlQueryOptions,
        CAMLRowLimit: '1000',
        debug: true,
    });

    eventQuery.getData(bindServiceQueryData);
};




/**
 * Function: bindServiceQueryData(data)
 *
 * - Binds results from the getEventsByServiceQuery() 
 *   to calendarVM class.
 */

function bindServiceQueryData(data: Array<Object>): void {

    'use strict';

    for (let i: number = 0, l: number = data.length; i < l; i++) {

        const event: Object = data[i];

        calendarVM.addEvent(
            event['Title'],
            event['Catagory'],
            event['Description'],
            event['EventDate'],
            event['EndDate'],
            moment(event['EventDate']).format('MMM Do, YYYY'),
            event['RecurrenceID'],
            event['fAllDayEvent'],
            event['FileRef'],
            event['ID']
        );

        calendarVM.addSpecialDate(
            event['EventDate'],
            event['Title']
        );
   }

    const today: Date = new Date();
    const todaysMonth: number = today.getMonth();
    const todaysYear: number = today.getFullYear();
    calendarVM.updateMonthEvents(todaysMonth, todaysYear);

    loadDatePicker();
};




/**
 * Function: loadDatePicker()
 *
 * - Loads the glDatePicker calendar with
 *   all dates found inside specialDates.
 */

function loadDatePicker(): void {

    'use strict';

    let calendarLoader: any = document.getElementsByClassName('calendar_loader')[0];
    calendarLoader.style.display = 'none';

    let calendarCtrl: any = jQuery('input').glDatePicker({
        showAlways: true,
        cssName: 'custom',
        specialDates: calendarVM.specialDates,
        onCalendarRefresh: onMonthChange,
    }).glDatePicker();

    function onMonthChange(firstDate: any): void {
        calendarVM.updateMonthEvents(firstDate.getMonth(), firstDate.getFullYear());
    }
}
