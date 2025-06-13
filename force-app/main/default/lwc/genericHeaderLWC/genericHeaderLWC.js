import { LightningElement, api, track } from 'lwc';

/**
 * GenericHeaderLWC
 * @description Custom Lightning Web Component designed to display a dynamic header that includes 
 *              an icon, header title, record count, and time since last update. It also provides a 
 *              refresh functionality.
 * @date 2024-10-10
 * @version 1.0
 * @author Gnanasai Pedagopu
 */
export default class GenericHeaderLWC extends LightningElement {
    // Public API properties exposed on the component for binding and setting by parent components
    @api headerName;       // Name of the header to display
    @api iconName;         // Name of the icon to be shown next to the header
    @api recordsCount;     // Count of the records that relate to this header

    // Private tracked property updated within component to re-render the component on change
    @track timeSinceUpdate; // Description of how long ago the data was last updated

    // Private variable stored to manage updating logic
    lastUpdated; // Stores the timestamp when the last update occurred

    /**
     * Lifecycle hook that gets called when component is inserted into the DOM.
     * It initializes the timestamp and sets up a timer to update the 'timeSinceUpdate' at regular intervals (60s).
     */
    connectedCallback() {
        this.lastUpdated = new Date().toISOString();
        this.calculateTimeSinceUpdate();
        this.timerId = setInterval(() => {
            this.calculateTimeSinceUpdate();
        }, 60000); // Set interval to 1 minute
    }

    /**
     * Computes the time difference between the current time and the last updated time
     * and updates the timeSinceUpdate property with a readable format.
     */
    calculateTimeSinceUpdate() {
        const lastUpdatedTime = new Date(this.lastUpdated).getTime(); // Getting last updated time in milliseconds
        const currentTime = Date.now(); // Current time in milliseconds
        const timeDiff = currentTime - lastUpdatedTime; // Difference in milliseconds

        const minutesAgo = Math.floor(timeDiff / 60000); // Convert difference from milliseconds to minutes

        if (minutesAgo < 1) {
            this.timeSinceUpdate = `a few seconds ago`; // For updates within the last minute
        } else if (minutesAgo < 60) {
            this.timeSinceUpdate = `${minutesAgo} minutes ago`; // For updates within the last hour
        } else {
            const hoursAgo = Math.floor(minutesAgo / 60); // Convert minutes to hours for longer durations
            this.timeSinceUpdate = `${hoursAgo} hour(s) ago`; // For updates longer than an hour ago
        }
    }

    /**
     * Handles the refresh action from the user, resetting the update timestamp
     * and recalculating the time since last update, and dispatching a custom event.
     * @param {Event} event - The event object for the refresh action.
     */
    handleRefresh(event) {
        this.lastUpdated = new Date().toISOString(); // Resetting the last updated timestamp
        this.calculateTimeSinceUpdate(); // Recalculate the time since update

        clearInterval(this.timerId); // Clear the existing interval
        this.timerId = setInterval(() => {
            this.calculateTimeSinceUpdate();
        }, 60000); // Reinitialize the interval for automatic updates

        // Dispatch a custom event notifying that a refresh has occurred
        this.dispatchEvent(new CustomEvent('refreshevent', { detail: { refresh: true } }));
    }
}