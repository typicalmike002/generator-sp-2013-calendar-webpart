export class CalendarViewModel {

    public specialDates: Array<any> = [];
    private calendarEvents: Array<any> = [];
    private monthEvents: any = ko.observableArray([]);

    public addEvent(
        title: string, 
        category: string, 
        description: string, 
        startDate: Date, 
        endDate: Date,
        formatedDate: string,
        recurrenceID: Date,
        isAllDayEvent: Boolean,
        linkUrl: string,
        itemID: number
    ): void {
        this.calendarEvents.push({
            Title: title,
            Category: category,
            Description: description,
            StartDate: startDate,
            EndDate: endDate,
            FormatedDate: formatedDate,
            RecurrenceID: Date,
            IsAllDayEvent: isAllDayEvent,
            LinkUrl: linkUrl,
            itemID: itemID,
        });
    };

    public updateMonthEvents(month: number, year: number): void {

        this.monthEvents.removeAll();

        for (let i: number = 0, l: number = this.calendarEvents.length; i < l; i++) {
            if (this.calendarEvents[i].StartDate.getMonth() === month &&
                this.calendarEvents[i].StartDate.getFullYear() === year) {
      
                this.monthEvents.push(this.calendarEvents[i]);
            }   
        }
    }

    public addSpecialDate(eventDate: Date, eventTitle: string): void {

        this.specialDates.push({
            date: eventDate,
            data: eventTitle,
            repeatMonth: false,
        });
    };

    public openPopup(event: any): void {
        console.log(event);
        SP.UI.ModalDialog.showModalDialog({
            title: 'ababa',
            url: event.LinkUrl.lookupValue
        });
    }
};


export class SPServicesJsonQuery {

    private settings: Object;

    constructor(settings: Object) {
        this.settings = settings;
    }

    public getData(onSuccess: Function): void {

        let requestData: any = jQuery().SPServices.SPGetListItemsJson(this.settings);

        jQuery.when(requestData).done(function(): void {
            onSuccess(this.data);
        }).fail(function(errorThrown: Object): void {
            console.log('The SPServicesJsonQuery on: ' + this.listName + ' list failed.\n' + errorThrown);
        });
    }
};