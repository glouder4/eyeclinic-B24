// @flow
import {Runtime, Type, Event, Loc, Dom, Tag, Text, Browser} from 'main.core';
import {Util} from 'calendar.util';
import {EventEmitter, BaseEvent} from 'main.core.events';
import {Selector} from './selector.js';
import {PopupWindowManager} from "main.popup";

export class Planner extends EventEmitter
{
	DOM = {};
	config = {};
	entryStatusMap = {
		h : 'user-status-h',
		y : 'user-status-y',
		q : 'user-status-q',
		n : 'user-status-n'
	};
	scaleTypes = ['15min','30min','1hour', '2hour', '1day'];
	savedScaleType = null;
	SCALE_OFFSET_BEFORE = 0;  // in days
	SCALE_OFFSET_AFTER = 13;  // in days
	EXPAND_OFFSET = 3; // in days
	EXPAND_DELAY = 2000; // ms
	REBUILD_DELAY = 100;
	maxTimelineSize = 300;
	MIN_ENTRY_ROWS = 3;
	MAX_ENTRY_ROWS = 300;
	width = 700;
	height = 84;
	minWidth = 700;
	minHeight = 84;
	workTime = [8, 18];
	scrollStep = 10;
	shown = false;
	built = false;
	locked = false;
	shownScaleTimeFrom = 24;
	shownScaleTimeTo = 0;
	timelineCellWidthOrig = false;
	proposeTimeLimit = 14; // in days
	expandTimelineDelay = 600;
	limitScaleSizeMode = false;
	useAnimation = true;
	checkTimeCache = {};
	entriesIndex = new Map();
	solidStatus = false;

	constructor(params = {})
	{
		super();
		this.setEventNamespace('BX.Calendar.Planner');
		this.config = params;
		this.id = params.id;
		this.dayOfWeekMonthFormat = params.dayOfWeekMonthFormat || 'd F, l';
		this.userId = parseInt(params.userId || Loc.getMessage('USER_ID'));
		this.DOM.wrap = params.wrap;
		this.SCALE_TIME_FORMAT = BX.isAmPmMode() ? 'g a' : 'G';

		this.expandTimelineDebounce = Runtime.debounce(this.expandTimeline, this.EXPAND_DELAY, this);
		this.setConfig(params);
	}

	show()
	{
		if (this.currentFromDate && this.currentToDate)
		{
			const hourFrom = this.currentFromDate.getHours();
			const hourTo = this.currentToDate.getHours() + Math.ceil(this.currentToDate.getMinutes() / 60);
			this.extendScaleTimeLimits(hourFrom, hourTo);
		}

		if (this.currentFromDate && this.currentToDate)
		{
			this.updateScaleLimitsFromEntry(this.currentFromDate, this.currentToDate);
		}

		let animation = false;

		if (this.hideAnimation)
		{
			this.hideAnimation.stop();
			this.hideAnimation = null;
		}

		if (!this.isBuilt())
		{
			this.build();
			this.bindEventHandlers();
		}
		else
		{
			this.resizePlannerWidth(this.width);
		}

		this.buildTimeline();
		this.DOM.wrap.style.display = '';

		if (this.adjustWidth)
		{
			this.resizePlannerWidth(this.DOM.timelineInnerWrap.offsetWidth);
		}

		this.selector.update({
			from: this.currentFromDate,
			to: this.currentToDate,
			animation: false
		});
		if (this.currentFromDate && this.currentToDate
			&& this.currentFromDate.getTime() >= this.scaleDateFrom.getTime()
			&& this.currentToDate.getTime() <= this.scaleDateTo.getTime()
		)
		{
			this.selector.focus(false, 0, true);
		}

		if (this.readonly)
		{
			Dom.addClass(this.DOM.mainWrap, 'calendar-planner-readonly');
		}
		else
		{
			Dom.removeClass(this.DOM.mainWrap, 'calendar-planner-readonly');
		}

		if (this.compactMode)
		{
			Dom.addClass(this.DOM.mainWrap, 'calendar-planner-compact');
		}
		else
		{
			Dom.removeClass(this.DOM.mainWrap, 'calendar-planner-compact');
		}

		this.DOM.entriesOuterWrap.style.display = this.compactMode ? 'none' : '';

		if (animation)
		{
			if (this.showAnimation)
			{
				this.showAnimation.stop();
			}
			this.showAnimation = new BX.easing({
				duration: 300,
				start: {height: 0},
				finish: {height: this.height},
				transition: BX.easing.makeEaseOut(BX.easing.transitions.quart),
				step: (state) => {this.DOM.wrap.style.height = state.height + 'px';},
				complete: () => {
					if (parseInt(this.DOM.wrap.style.height) < this.height)
					{
						this.DOM.wrap.style.height = this.height + 'px';
					}
					this.showAnimation = null;
					this.selector.focus();
				}
			});
			this.showAnimation.animate();
		}
		else
		{
			if (parseInt(this.DOM.wrap.style.height) < this.height)
			{
				this.DOM.wrap.style.height = this.height + 'px';
			}
			this.adjustHeight();
		}

		this.shown = true;
	}

	setConfig(params)
	{
		this.todayLocMessage = Loc.getMessage('EC_PLANNER_TODAY');

		this.setScaleType(params.scaleType);

		// showTimelineDayTitle
		if (params.showTimelineDayTitle !== undefined)
		{
			this.showTimelineDayTitle = !!params.showTimelineDayTitle;
		}
		else if(this.showTimelineDayTitle === undefined)
		{
			this.showTimelineDayTitle = true;
		}

		// compactMode
		if (params.compactMode !== undefined)
		{
			this.compactMode = !!params.compactMode;
		}
		else if (this.compactMode === undefined)
		{
			this.compactMode = false;
		}

		// readonly
		if (params.readonly !== undefined)
		{
			this.readonly = !!params.readonly;
		}
		else if (this.readonly === undefined)
		{
			this.readonly = false;
		}

		if (this.compactMode)
		{
			let compactHeight = 50;
			if (this.showTimelineDayTitle && !this.isOneDayScale())
				compactHeight += 20;
			this.height = this.minHeight = compactHeight;
		}

		// Select mode
		if (params.selectEntriesMode !== undefined)
		{
			this.selectMode = !!params.selectEntriesMode;
		}
		else if (this.selectMode === undefined)
		{
			this.selectMode = false;
		}

		if (Type.isInteger(params.SCALE_OFFSET_BEFORE))
		{
			this.SCALE_OFFSET_BEFORE = parseInt(params.SCALE_OFFSET_BEFORE);
		}
		if (Type.isInteger(params.SCALE_OFFSET_AFTER))
		{
			this.SCALE_OFFSET_AFTER = parseInt(params.SCALE_OFFSET_AFTER);
		}
		if (Type.isInteger(params.maxTimelineSize))
		{
			this.maxTimelineSize = parseInt(params.maxTimelineSize);
		}
		if (Type.isInteger(params.minEntryRows))
		{
			this.MIN_ENTRY_ROWS = parseInt(params.minEntryRows);
		}
		if (Type.isInteger(params.maxEntryRows))
		{
			this.MAX_ENTRY_ROWS = parseInt(params.maxEntryRows);
		}

		if (Type.isInteger(params.width))
		{
			this.width = parseInt(params.width);
		}
		if (Type.isInteger(params.height))
		{
			this.height = parseInt(params.height);
		}
		if (Type.isInteger(params.minWidth))
		{
			this.minWidth = parseInt(params.minWidth);
		}
		if (Type.isInteger(params.minHeight))
		{
			this.minHeight = parseInt(params.minHeight);
		}
		this.width = Math.max(this.minWidth, this.width);
		this.height = Math.max(this.minHeight, this.height);

		if (Type.isArray(params.workTime))
		{
			this.workTime = params.workTime;
		}
		this.extendScaleTime(this.workTime[0], this.workTime[1]);

		this.weekHolidays = params.weekHolidays || this.weekHolidays || [];
		this.yearHolidays = params.yearHolidays || this.yearHolidays || [];
		this.accuracy = params.accuracy || this.accuracy || 300; // 5 min
		this.clickSelectorScaleAccuracy = params.clickSelectorScaleAccuracy || this.accuracy; // 5 min
		this.selectorAccuracy = parseInt(params.selectorAccuracy) || this.selectorAccuracy || 300; // 5 min
		this.entriesListWidth = parseInt(params.entriesListWidth) || this.entriesListWidth || 200;
		this.timelineCellWidth = params.timelineCellWidth || this.timelineCellWidth || 40;
		this.solidStatus = params.solidStatus === true;

		this.showEntiesHeader = params.showEntiesHeader === undefined ? true : !!params.showEntiesHeader;
		this.showEntryName = params.showEntryName === undefined ? true : !!params.showEntryName;

		if (this.isOneDayScale() && this.timelineCellWidth < 100)
		{
			this.timelineCellWidthOrig = this.timelineCellWidth;
			this.timelineCellWidth = 100;
		}
		else if(this.timelineCellWidthOrig && !this.isOneDayScale())
		{
			this.timelineCellWidth = this.timelineCellWidthOrig;
			this.timelineCellWidthOrig = false;
		}

		if (this.allowAdjustCellWidth === undefined || params.allowAdjustCellWidth !== undefined)
		{
			this.allowAdjustCellWidth = this.readonly
				&& this.compactMode
				&& params.allowAdjustCellWidth !== false;
		}

		if (params.locked !== undefined)
		{
			this.locked = params.locked;
		}

		this.adjustCellWidth();

		// Scale params
		this.setScaleLimits(params.scaleDateFrom, params.scaleDateTo);
	}

	updateScaleLimitsFromEntry(from, to)
	{
		if (from.getTime() > this.scaleDateTo.getTime() || to.getTime() < this.scaleDateFrom.getTime())
		{
			this.setScaleLimits(new Date(from.getTime()), new Date(to.getTime() + Util.getDayLength() * this.SCALE_OFFSET_AFTER));
		}
	}

	setScaleLimits(scaleDateFrom, scaleDateTo)
	{
		if (scaleDateFrom !== undefined)
		{
			this.scaleDateFrom = Type.isDate(scaleDateFrom) ? scaleDateFrom : Util.parseDate(scaleDateFrom);
		}

		if (!Type.isDate(this.scaleDateFrom))
		{
			if (this.compactMode && this.readonly)
			{
				this.scaleDateFrom = new Date();
			}
			else
			{
				this.scaleDateFrom = new Date(new Date().getTime() - Util.getDayLength() * this.SCALE_OFFSET_BEFORE);
			}
		}
		this.scaleDateFrom.setHours(this.isOneDayScale() ? 0 : this.shownScaleTimeFrom, 0, 0, 0);

		if (scaleDateTo !== undefined)
		{
			this.scaleDateTo = BX.type.isString(scaleDateTo) ? Util.parseDate(scaleDateTo) : scaleDateTo;
		}

		if (!Type.isDate(this.scaleDateTo))
		{
			if (this.compactMode && this.readonly)
			{
				this.scaleDateTo = new Date();
			}
			else
			{
				this.scaleDateTo = new Date(new Date().getTime() + Util.getDayLength() * this.SCALE_OFFSET_AFTER);
			}
		}
		this.scaleDateTo.setHours(this.isOneDayScale() ? 0 : this.shownScaleTimeTo, 0, 0, 0);
	}

	extendScaleTimeLimits(fromTime, toTime)
	{
		if (fromTime !== false && !isNaN(parseInt(fromTime)))
		{
			this.shownScaleTimeFrom = Math.min(parseInt(fromTime), this.shownScaleTimeFrom, 23);
			this.shownScaleTimeFrom = Math.max(this.shownScaleTimeFrom, 0);

			if (this.scaleDateFrom)
			{
				this.scaleDateFrom.setHours(this.shownScaleTimeFrom, 0, 0 ,0);
			}
		}

		if (toTime !== false && !isNaN(parseInt(toTime)))
		{
			this.shownScaleTimeTo = Math.max(parseInt(toTime), this.shownScaleTimeTo, 1);
			this.shownScaleTimeTo = Math.min(this.shownScaleTimeTo, 24);

			if (this.scaleDateTo)
			{
				this.scaleDateTo.setHours(this.shownScaleTimeTo, 0, 0, 0);
			}
		}

		if (this.shownScaleTimeFrom % 2 !== 0)
		{
			this.shownScaleTimeFrom--;
		}

		if (this.shownScaleTimeTo % 2 !== 0)
		{
			this.shownScaleTimeTo++;
		}
	}

	SetLoadedDataLimits(from, to)
	{
		if (from)
		{
			this.loadedDataFrom = from.getTime ? from : Util.parseDate(from);
		}
		if (to)
		{
			this.loadedDataTo = to.getTime ? to : Util.parseDate(to);
		}
	}

	extendScaleTime(fromTime, toTime)
	{
		const savedTimeFrom = this.shownScaleTimeFrom;
		const savedTimeTo = this.shownScaleTimeTo;

		this.extendScaleTimeLimits(fromTime, toTime);

		if (fromTime === false && toTime !== false)
		{
			setTimeout(() => {
				this.extendTimelineToRight(savedTimeTo, this.shownScaleTimeTo);
			}, 200);
		}
		if (fromTime !== false && toTime === false)
		{
			setTimeout(() => {
				this.extendTimelineToLeft(this.shownScaleTimeFrom, savedTimeFrom);
			}, 200);
		}
		if (fromTime !== false && toTime !== false)
		{
			this.rebuildDebounce();
		}
	}

	adjustCellWidth()
	{
		if (this.allowAdjustCellWidth)
		{
			this.timelineCellWidth = Math.round(this.width / ((this.shownScaleTimeTo - this.shownScaleTimeFrom) * 3600 / this.scaleSize));
		}
	}

	build()
	{
		if (!Type.isDomNode(this.DOM.wrap))
		{
			throw new TypeError("Wrap is not DOM node");
		}

		this.DOM.wrap.style.width = this.width + 'px';

		// Left part - list of users and other resources
		let entriesListWidth = this.compactMode ? 0 : this.entriesListWidth;

		// Timeline with accessibility information
		this.DOM.mainWrap = this.DOM.wrap.appendChild(BX.create('DIV', {
			props: {
				className: 'calendar-planner-main-container calendar-planner-main-container-resource'
			},
			style: {
				minHeight: this.minHeight + 'px',
				height: this.height + 'px',
				width: this.width + 'px'
			}
		}));

		if (!this.showEntryName)
		{
			Dom.addClass(this.DOM.mainWrap, 'calendar-planner-entry-icons-only');
		}

		if (this.readonly)
		{
			Dom.addClass(this.DOM.mainWrap, 'calendar-planner-readonly');
		}

		this.DOM.entriesOuterWrap = this.DOM.mainWrap.appendChild(Tag.render`
			<div class="calendar-planner-user-container" style="width: ${entriesListWidth}px; height: ${this.height}px;"></div>
		`);

		Util.preventSelection(this.DOM.entriesOuterWrap);
		if (this.compactMode)
		{
			Dom.addClass(this.DOM.mainWrap, 'calendar-planner-compact');
			this.DOM.entriesOuterWrap.style.display = 'none';
		}

		if (this.isOneDayScale())
		{
			Dom.addClass(this.DOM.entriesOuterWrap, 'calendar-planner-no-daytitle');
		}
		else
		{
			Dom.removeClass(this.DOM.entriesOuterWrap, 'calendar-planner-no-daytitle');
		}

		if (this.showEntiesHeader !== false)
		{
			this.DOM.entrieListHeader = this.DOM.entriesOuterWrap.appendChild(Tag.render`
				<div class="calendar-planner-header"></div>
			`)
			.appendChild(Tag.render`
				<div class="calendar-planner-general-info"></div>
			`)
			.appendChild(Tag.render`
				<div class="calendar-planner-users-header"></div>
			`);

			this.entriesListTitleCounter = this.DOM.entrieListHeader.appendChild(Tag.render`
				<span class="calendar-planner-users-item">
					${Loc.getMessage('EC_PL_ATTENDEES_TITLE') + ' '}
				</span>
			`)
			.appendChild(Tag.render`<span></span>`);
		}

		this.DOM.entrieListWrap = this.DOM.entriesOuterWrap.appendChild(Tag.render`
			<div class="calendar-planner-user-container-inner"></div>
		`);

		// Fixed cont with specific width and height
		this.DOM.timelineFixedWrap = this.DOM.mainWrap.appendChild(Tag.render`
			<div class="calendar-planner-timeline-wrapper" style="height: ${this.height}px"></div>
		`);

		if (this.isLocked())
		{
			this.lock();
		}

		// overflow-y: hidden;
		this.DOM.timelineVerticalConstraint = this.DOM.timelineFixedWrap.appendChild(Tag.render`
			<div class="calendar-planner-timeline-constraint"></div>
		`);

		// Movable cont - used to move scale and data containers easy and at the same time
		this.DOM.timelineInnerWrap = this.DOM.timelineVerticalConstraint.appendChild(Tag.render`
			<div class="calendar-planner-timeline-inner-wrapper" data-bx-planner-meta="timeline"></div>
		`);

		// Scale container
		this.DOM.timelineScaleWrap = this.DOM.timelineInnerWrap.appendChild(Tag.render`
			<div class="calendar-planner-time"></div>
		`);
		Util.preventSelection(this.DOM.timelineScaleWrap);

		// Accessibility container
		this.DOM.timelineDataWrap = this.DOM.timelineInnerWrap.appendChild(Tag.render`
			<div class="calendar-planner-timeline-container" style="height: ${this.height}px"></div>
		`);
		// Container with accessibility entries elements
		this.DOM.accessibilityWrap = this.DOM.timelineDataWrap.appendChild(Tag.render`
			<div class="calendar-planner-acc-wrap"></div>
		`);

		if (this.isTodayButtonEnabled())
		{
			this.DOM.timelineVerticalConstraint.addEventListener('scroll', this.updateTodayButtonVisibility.bind(this));
		}

		// Selector
		this.selector = new Selector({
			selectMode: this.selectMode,
			timelineFixedWrap: this.DOM.timelineFixedWrap,
			timelineWrap: this.DOM.timelineVerticalConstraint,
			getPosByDate: this.getPosByDate.bind(this),
			getDateByPos: this.getDateByPos.bind(this),
			getEvents: this.getAllEvents.bind(this),
			getPosDateMap: () => {
				return this.posDateMap;
			},
			useAnimation: this.useAnimation,
			solidStatus: this.solidStatus,
			getScaleInfo: () => {return {
				scale: this.scaleType,
				shownTimeFrom: this.shownScaleTimeFrom,
				shownTimeTo: this.shownScaleTimeTo,
				scaleDateFrom: this.scaleDateFrom,
				scaleDateTo: this.scaleDateTo,
			}},
			getTimelineWidth: () => {
				return parseInt(this.DOM.timelineInnerWrap.style.width)
			}
		});
		this.DOM.timelineDataWrap.appendChild(this.selector.getWrap());
		this.DOM.mainWrap.appendChild(this.selector.getTitleNode());
		this.selector.subscribe('onChange', this.handleSelectorChanges.bind(this));
		this.selector.subscribe('doCheckStatus', this.doCheckSelectorStatus.bind(this));

		if (this.selectMode)
		{
			this.selectedEntriesWrap = this.DOM.mainWrap.appendChild(Tag.render`
				<div class="calendar-planner-timeline-select-entries-wrap"></div>
			`);

			this.hoverRow = this.DOM.mainWrap.appendChild(Tag.render`
				<div class="calendar-planner-timeline-hover-row" style="top: 0; width: ${parseInt(this.DOM.mainWrap.offsetWidth)}px"></div>
			`);


			Event.bind(document, 'mousemove', this.mouseMoveHandler.bind(this));
		}

		if (!this.compactMode)
		{
			this.DOM.settingsButton = this.DOM.mainWrap.appendChild(Tag.render`<div class="calendar-planner-settings-icon-container" title="${Loc.getMessage('EC_PL_SETTINGS_SCALE')}"><span class="calendar-planner-settings-title">${Loc.getMessage('EC_PL_SETTINGS_SCALE')}</span><span class="calendar-planner-settings-icon"></span></div>`);
			Event.bind(this.DOM.settingsButton, 'click', () => this.showSettingsPopup());
		}

		this.built = true;
	}

	buildTimeline(clearCache)
	{
		if (
			this.isBuilt()
			&& (this.lastTimelineKey !== this.getTimelineShownKey()
			|| clearCache === true)
		)
		{
			Dom.clean(this.DOM.timelineScaleWrap);

			this.scaleData = this.getScaleData();

			let
				outerDayCont,
				dayTitle,
				cont = this.DOM.timelineScaleWrap;

			this.futureDayTitles = [];
			this.todayButtonPivotDay = undefined;
			for (let i = 0; i < this.scaleData.length; i++)
			{
				if (this.showTimelineDayTitle && !this.isOneDayScale())
				{
					if (this.scaleDayTitles[this.scaleData[i].daystamp])
					{
						cont = this.scaleDayTitles[this.scaleData[i].daystamp];
					}
					else
					{
						const date = new Date(this.scaleData[i].timestamp);
						date.setHours(0, 0, 0, 0);
						const today = new Date();
						today.setHours(0, 0, 0, 0);

						outerDayCont = this.DOM.timelineScaleWrap.appendChild(Tag.render`
							<div class="calendar-planner-time-day-outer"></div>
						`);

						let dayTitleClass = 'calendar-planner-time-day-title';
						if (date.getTime() < today.getTime())
						{
							dayTitleClass += ' calendar-planner-time-day-past';
						}

						//F d, l
						dayTitle = outerDayCont.appendChild(Tag.render`
							<div class="${dayTitleClass}">
								<span>${BX.date.format(this.dayOfWeekMonthFormat, this.scaleData[i].timestamp / 1000)}</span>
								<div class="calendar-planner-time-day-border"></div>
							</div>
						`);

						if (date.getTime() > today.getTime())
						{
							this.futureDayTitles.push(dayTitle.querySelector('span'));
						}

						if (date.getTime() === today.getTime() && this.isTodayButtonEnabled())
						{
							this.todayTitleButton = dayTitle.firstElementChild.appendChild(Tag.render`
								<div class="calendar-planner-today-button"></div>
							`);
							this.todayTitleButton.innerHTML = this.todayLocMessage;
							this.todayTitleButton.addEventListener('click', this.todayButtonClickHandler.bind(this));
							this.todayButtonPivotDay = outerDayCont;
						}

						cont = outerDayCont.appendChild(Tag.render`
							<div class="calendar-planner-time-day"></div>
						`);

						this.scaleDayTitles[this.scaleData[i].daystamp] = cont;

					}
				}

				let className = 'calendar-planner-time-hour-item' + (this.scaleData[i].dayStart ? ' calendar-planner-day-start' : '');

				if (
					(this.scaleType === '15min' || this.scaleType === '30min')
					&& this.scaleData[i].title !== ''
				)
				{
					className += ' calendar-planner-time-hour-bold';
				}

				this.scaleData[i].cell = cont.appendChild(BX.create('DIV', {
					props: {
						className: className
					},
					style: {
						width: this.timelineCellWidth + 'px',
						minWidth: this.timelineCellWidth + 'px'
					},
					html: this.scaleData[i].title ? '<i>' + this.scaleData[i].title + '</i>' : ''
				}));

				if (!this.isOneDayScale() && this.scaleData[i + 1] && this.scaleData[i + 1].dayStart)
				{
					cont.appendChild(Tag.render`
						<div class="calendar-planner-timeline-border"></div>
					`);
				}
			}

			let mapDatePosRes = this.mapDatePos();
			this.posDateMap = mapDatePosRes.posDateMap;

			const timelineOffset = this.DOM.timelineScaleWrap.offsetWidth;
			this.DOM.timelineInnerWrap.style.width = timelineOffset + 'px';
			this.DOM.entrieListWrap.style.top = (parseInt(this.DOM.timelineDataWrap.offsetTop) + 10) + 'px';

			this.lastTimelineKey = this.getTimelineShownKey();
			this.checkRebuildTimeout(timelineOffset);
			this.buildTodayButtonWrap();
		}
	}

	buildTodayButtonWrap()
	{
		if (!this.isTodayButtonEnabled())
		{
			return;
		}

		if (this.todayButton)
		{
			this.todayButton.remove();
		}
		if (this.todayRightButton)
		{
			this.todayRightButton.remove();
		}
		if (this.DOM.todayButtonContainer)
		{
			this.DOM.todayButtonContainer.remove();
		}
		if (this.isOneDayScale())
		{
			return;
		}

		const todayButton = this.DOM.entriesOuterWrap.appendChild(Tag.render`
			<div class="calendar-planner-today-button">${this.todayLocMessage}</div>
		`);
		this.todayButtonWidth = todayButton.offsetWidth;
		todayButton.innerHTML = this.todayLocMessage + ' &rarr;';
		this.todayButtonRightWidth = todayButton.offsetWidth;
		todayButton.innerHTML = this.todayLocMessage + ' &larr;';
		this.todayButtonLeftWidth = todayButton.offsetWidth;
		const top = BX.pos(todayButton).top - BX.pos(this.DOM.timelineScaleWrap).top;
		todayButton.remove();

		let left = 0;
		if (this.todayButtonPivotDay)
		{
			left = this.todayButtonPivotDay.offsetLeft + this.todayButtonPivotDay.offsetWidth - 10 - this.todayButtonWidth + 1;
		}
		const width = this.DOM.timelineScaleWrap.offsetWidth - left;
		this.DOM.todayButtonContainer = this.DOM.timelineScaleWrap.appendChild(Tag.render`
			<div class="calendar-planner-today-button-container" style="width: ${width}px; left: ${left}px; top: ${top}px;"></div>
		`);
		this.todayButton = this.DOM.todayButtonContainer.appendChild(Tag.render`
			<div class="calendar-planner-today-button" style="width: ${this.todayButtonWidth}px; direction: rtl;">${this.todayLocMessage}</div>
		`);
		this.todayRightButton = this.DOM.timelineVerticalConstraint.appendChild(Tag.render`
			<div class="calendar-planner-today-button" style="right: 0; top: 5px; position: absolute;">${this.todayLocMessage}</div>
		`);

		this.todayButton.addEventListener('click', this.todayButtonClickHandler.bind(this));
		this.todayRightButton.addEventListener('click', this.todayButtonClickHandler.bind(this));
		this.updateTodayButtonVisibility(false);

		if (this.isLocked() && this.DOM.todayButtonContainer)
		{
			Dom.addClass(this.DOM.todayButtonContainer, '--lock');
		}
	}

	getTimelineShownKey()
	{
		return 'tm_' + this.scaleDateFrom.getTime() + '_' + this.scaleDateTo.getTime();
	}

	checkRebuildTimeout(timelineOffset, timeout = 300)
	{
		if (!this._checkRebuildTimeoutCount)
		{
			this._checkRebuildTimeoutCount = 0;
		}

		if (this.rebuildTimeout)
		{
			this.rebuildTimeout = !!clearTimeout(this.rebuildTimeout);
		}

		if (
			this._checkRebuildTimeoutCount <= 10
			&& Type.isElementNode(this.DOM.timelineScaleWrap)
			&& Dom.isShown(this.DOM.timelineScaleWrap)
		)
		{
			this._checkRebuildTimeoutCount++;
			this.rebuildTimeout = setTimeout(() => {
				if (timelineOffset !== this.DOM.timelineScaleWrap.offsetWidth)
				{
					if (this.rebuildTimeout)
					{
						this.rebuildTimeout = !!clearTimeout(this.rebuildTimeout);
					}

					this.rebuild();
					if (this.selector)
					{
						this.selector.focus(true, 300);
					}
				}
				else
				{
					this.checkRebuildTimeout(timelineOffset, timeout);
				}
			}, timeout);
		}
		else
		{
			delete this._checkRebuildTimeoutCount;
		}
	}

	rebuildDebounce(timeout = this.REBUILD_DELAY)
	{
		Runtime.debounce(this.rebuild, timeout, this)();
	}

	extendTimelineToLeft(extendedTimeFrom, extendedTimeTo)
	{
		this.extendTimeline(extendedTimeFrom, extendedTimeTo);
	}

	extendTimelineToRight(extendedTimeFrom, extendedTimeTo)
	{
		this.extendTimeline(extendedTimeFrom, extendedTimeTo, true)
	}

	extendTimeline(extendedTimeFrom, extendedTimeTo, isToRight = false)
	{
		if (!this.DOM.timelineScaleWrap)
		{
			return;
		}
		const isToLeft = !isToRight;
		const dayNodeList = this.DOM.timelineScaleWrap.querySelectorAll('.calendar-planner-time-day');
		const dayCount = dayNodeList.length;
		const nodeCountInDay = this.scaleData.length / dayCount;
		const extendCount = extendedTimeTo - extendedTimeFrom;

		let cellsInsertedOnLeftCount = 0;
		const insertedNodes = [];
		let pivotScaleDatumOfDayIndex = isToRight ? nodeCountInDay - 1 : 0;

		for (const dayNode of dayNodeList)
		{
			const pivotNodeOfDay = isToLeft
				? dayNode.children[0]
				: dayNode.querySelector('.calendar-planner-timeline-border');
			if (isToLeft)
			{
				this.scaleData[pivotScaleDatumOfDayIndex].dayStart = false;
			}

			const daystamp = this.scaleData[pivotScaleDatumOfDayIndex].daystamp;
			let toTimestamp, fromTimestamp;
			if (isToLeft)
			{
				toTimestamp = this.scaleData[pivotScaleDatumOfDayIndex].timestamp / 1000;
				fromTimestamp = toTimestamp - 3600 * extendCount;
				if (new Date(fromTimestamp * 1000).getHours() !== extendedTimeFrom)
				{
					return;
				}
			}
			else
			{
				fromTimestamp = this.scaleData[pivotScaleDatumOfDayIndex].timestamp / 1000 + this.scaleSize;
				toTimestamp = fromTimestamp + 3600 * extendCount;
				if (new Date(fromTimestamp * 1000).getHours() !== extendedTimeFrom)
				{
					return;
				}
			}

			for (let insertedTimestamp = fromTimestamp, i = 0; insertedTimestamp < toTimestamp; insertedTimestamp += this.scaleSize, i++)
			{
				const title = BX.date.format('i', insertedTimestamp) === '00'
					? BX.date.format(this.SCALE_TIME_FORMAT, insertedTimestamp)
					: '';
				if (insertedTimestamp < this.currentFromDate.getTime() / 1000 - (isToLeft ? 3600 * 12 : 0))
				{
					cellsInsertedOnLeftCount++;
				}
				let animationClass = 'expand-width-no-animation';
				if (
					(
						isToLeft
						&& insertedTimestamp > this.currentFromDate.getTime() / 1000 - 3600 * 12
						&& insertedTimestamp < this.currentFromDate.getTime() / 1000 + 3600 * 12
					)
					||
					(
						isToRight
						&& insertedTimestamp > this.currentFromDate.getTime() / 1000
						&& insertedTimestamp < this.currentFromDate.getTime() / 1000 + 3600 * 24
					)
				)
				{
					animationClass = 'expand-width-0-40';
				}

				const insertedCell = BX.create('DIV', {
					props: {
						className: 'calendar-planner-time-hour-item' + ' ' + animationClass,
					},
					style: {
						width: this.timelineCellWidth + 'px',
						minWidth: this.timelineCellWidth + 'px'
					},
					html: '<i>' + title + '</i>'
				});
				insertedNodes.push(insertedCell);
				dayNode.insertBefore(insertedCell, pivotNodeOfDay);

				const insertedScaleDatum = {
					daystamp: daystamp,
					timestamp: insertedTimestamp * 1000,
					value: insertedTimestamp * 1000,
					title: title,
					dayStart: isToLeft && i === 0,
					cell: insertedCell
				};
				this.scaleData.splice(i + pivotScaleDatumOfDayIndex + (isToRight ? 1 : 0), 0, insertedScaleDatum);
			}
			if (isToLeft)
			{
				pivotNodeOfDay.classList.remove('calendar-planner-day-start');
				dayNode.children[0].classList.add('calendar-planner-day-start');
			}
			pivotScaleDatumOfDayIndex += nodeCountInDay + extendCount * 3600 / this.scaleSize;
		}

		// set scroll for timeline to compensate width of static inserted cells
		const scroll = this.DOM.timelineVerticalConstraint.scrollLeft;
		this.DOM.timelineVerticalConstraint.scrollLeft = scroll + cellsInsertedOnLeftCount * this.timelineCellWidth;

		// get accessibility events for animation
		const midnight = new Date(this.currentFromDate.getTime());
		midnight.setHours(0,0,0,0);
		if (isToRight)
		{
			midnight.setDate(midnight.getDate() + 1);
		}
		const visibleEvents = this.getVisibleEvents();
		const animatedEvents = this.getEventsAfter(visibleEvents, midnight);
		this.update(this.entries, this.accessibility);

		// update selector and visible events position during the css animation
		new BX.easing({
			duration: 200,
			start: {},
			finish: {},
			transition: BX.easing.makeEaseOut(BX.easing.transitions.linear),
			step: () => {
				this.buildTodayButtonWrap();
				this.selector.update();
				for (const event of animatedEvents)
				{
					event.node.style.left = this.getPosByDate(new Date(event.fromTimestamp)) + 'px';
				}
			},
			complete: () => {
				for (const node of insertedNodes)
				{
					node.classList.remove('expand-width-no-animation');
					node.classList.remove('expand-width-0-40');
				}
				this.updateTimelineAfterExtend();
			}
		}).animate();
	}

	updateTimelineAfterExtend()
	{
		let mapDatePosRes = this.mapDatePos();
		this.posDateMap = mapDatePosRes.posDateMap;
		const timelineOffset = this.DOM.timelineScaleWrap.offsetWidth;
		this.DOM.timelineInnerWrap.style.width = timelineOffset + 'px';
		this.DOM.entrieListWrap.style.top = (parseInt(this.DOM.timelineDataWrap.offsetTop) + 10) + 'px';
		this.lastTimelineKey = this.getTimelineShownKey();
		this.update(this.entries, this.accessibility);
		this.adjustHeight();
		this.resizePlannerWidth(this.width);
		this.selector.update();
		this.clearCacheTime();
		this.buildTodayButtonWrap();
	}

	rebuild(params = {})
	{
		if (this.isBuilt())
		{
			this.buildTimeline(true);
			this.update(this.entries, this.accessibility);
			this.adjustHeight();
			this.resizePlannerWidth(this.width);

			if (params.updateSelector !== false)
			{
				this.selector.update(params.selectorParams);
				this.selector.focus(false, 0, true);
			}

			this.clearCacheTime();
		}
	}

	getScaleData()
	{
		this.scaleData = [];
		this.scaleDayTitles = {};

		let
			ts, scaleFrom, scaleTo,
			time, dayStamp, title,
			curDayStamp = false,
			timeFrom = this.isOneDayScale() ? 0 : this.shownScaleTimeFrom,
			timeTo = this.isOneDayScale() ? 0 : this.shownScaleTimeTo;

		this.scaleDateFrom.setHours(timeFrom, 0, 0, 0);
		this.scaleDateTo.setHours(timeTo, 0, 0, 0);
		scaleFrom = this.scaleDateFrom.getTime();
		scaleTo = this.scaleDateTo.getTime();

		for (ts = scaleFrom; ts < scaleTo; ts += this.scaleSize * 1000)
		{
			time = parseFloat(BX.date.format('H.i', ts / 1000));

			if (this.isOneDayScale())
				title = BX.date.format('d F, D', ts / 1000);
			else
				title = BX.date.format('i', ts / 1000) === '00'
					? BX.date.format(this.SCALE_TIME_FORMAT, ts / 1000)
					: '';

			if (this.isOneDayScale() || (time >= timeFrom && time < timeTo))
			{
				dayStamp = BX.date.format('d.m.Y', ts / 1000);
				this.scaleData.push({
					daystamp: dayStamp,
					timestamp: ts,
					value: ts,
					title: title,
					dayStart: curDayStamp !== dayStamp
				});
				curDayStamp = dayStamp;
			}
		}

		return this.scaleData;
	}

	isOneDayScale()
	{
		return this.scaleType === '1day';
	}

	static prepareAccessibilityItem(entry)
	{
		if (!Type.isDate(entry.from))
		{
			entry.from = Util.parseDate(entry.dateFrom);
		}

		if (!Type.isDate(entry.to))
		{
			entry.to = Util.parseDate(entry.dateTo);
		}

		if (!Type.isDate(entry.from) || !Type.isDate(entry.to))
		{
			return false;
		}

		entry.from.setSeconds(0,0);
		entry.fromTimestamp = entry.from.getTime();

		entry.to.setSeconds(0,0);
		entry.toTimestamp = entry.to.getTime();

		if (!Type.isDate(entry.toReal))
		{
			entry.toReal = entry.to;
			entry.toTimestampReal = entry.toTimestamp;
		}

		return entry;
	}

	addAccessibilityItem(entry, wrap)
	{
		let
			timeFrom, timeTo,
			hidden = false,
			fromTimestamp = entry.fromTimestamp,
			toTimestamp = entry.toTimestampReal || entry.toTimestamp,
			shownScaleTimeFrom = this.isOneDayScale() ? 0 : this.shownScaleTimeFrom,
			shownScaleTimeTo = this.isOneDayScale() ? 24 : this.shownScaleTimeTo,
			from = new Date(fromTimestamp),
			to = new Date(toTimestamp);

		timeFrom = parseInt(from.getHours()) + from.getMinutes() / 60;
		timeTo = parseInt(to.getHours()) + to.getMinutes() / 60;

		if (timeFrom > shownScaleTimeTo)
		{
			from = new Date(from.getTime() + Util.getDayLength() - 1);
			from.setHours(shownScaleTimeFrom, 0, 0, 0);
			if (from.getTime() >= to.getTime())
			{
				hidden = true;
			}
		}

		if (!hidden && timeFrom < shownScaleTimeFrom)
		{
			from.setHours(shownScaleTimeFrom, 0, 0, 0);
			if (from.getTime() >= to.getTime())
			{
				hidden = true;
			}
		}

		if (!hidden && timeTo > shownScaleTimeTo)
		{
			to.setHours(shownScaleTimeTo, 0, 0, 0);
			if (from.getTime() >= to.getTime())
			{
				hidden = true;
			}
		}

		if (!hidden && timeTo < shownScaleTimeFrom)
		{
			to = new Date(to.getTime() - Util.getDayLength() + 1);
			to.setHours(shownScaleTimeTo, 0, 0, 0);
			if (from.getTime() >= to.getTime())
			{
				hidden = true;
			}
		}

		if (!hidden && from.getTime() < this.scaleDateTo)
		{
			let
				fromPos = this.getPosByDate(from),
				toPos = Math.min(this.getPosByDate(to), this.DOM.timelineScaleWrap.offsetWidth);

			entry.node = wrap.appendChild(BX.create('DIV', {
				props: {
					className: 'calendar-planner-acc-entry'
						+ (entry.type && entry.type === 'hr' ? ' calendar-planner-acc-entry-hr' : '')
				},
				style: {
					left: fromPos + 'px',
					width: Math.max((toPos - fromPos), 3) + 'px'
				}
			}));

			if (entry.title || entry.name)
			{
				entry.node.title = entry.title || entry.name;
			}
		}
	}

	displayEntryRow(entry, accessibility = [])
	{
		let rowWrap;
		if (entry.type === 'moreLink')
		{
			rowWrap = this.DOM.entrieListWrap.appendChild(Tag.render`
				<div class="calendar-planner-user"></div>
			`);

			if (this.showEntryName)
			{
				this.DOM.showMoreUsersLink = rowWrap.appendChild(Tag.render`
					<div class="calendar-planner-all-users" title="${entry.title || ''}">
						${entry.name}
					</div>
				`);
			}
			else
			{
				this.DOM.showMoreUsersLink = rowWrap.appendChild(Tag.render`
					<div class="calendar-planner-users-more" title="${entry.name || ''}">
						<span class="calendar-planner-users-more-btn"></span>
					</div>
				`);
			}
			Event.bind(this.DOM.showMoreUsersLink, 'click', () => this.showMoreUsers());

		}
		else if (entry.type === 'lastUsers')
		{
			rowWrap = this.DOM.entrieListWrap.appendChild(Tag.render`	
				<div class="calendar-planner-user"></div>
			`);

			if (this.showEntryName)
			{
				this.DOM.showMoreUsersLink = rowWrap.appendChild(Tag.render`
					<div class="calendar-planner-all-users calendar-planner-last-users" title="${entry.title || ''}">
						${entry.name}
					</div>
				`);
			}
			else
			{
				this.DOM.showMoreUsersLink = rowWrap.appendChild(Tag.render`
					<div class="calendar-planner-users-more" title="${entry.title || entry.name}">
						<span class="calendar-planner-users-last-btn"></span>
					</div>
				`);
			}
		}
		else if (entry.id && entry.type === 'user')
		{
			rowWrap = this.DOM.entrieListWrap.appendChild(BX.create('DIV', {
				attrs: {
					'data-bx-planner-entry' : entry.uid,
					className: 'calendar-planner-user'
						+ (entry.emailUser ? ' calendar-planner-email-user' : '')
				}
			}));

			if (entry.status && this.entryStatusMap[entry.status])
			{
				rowWrap.appendChild(BX.create('SPAN', {
					props: {
						className: 'calendar-planner-user-status-icon '
							+ this.entryStatusMap[entry.status],
						title: Loc.getMessage('EC_PL_STATUS_'
							+ entry.status.toUpperCase())
					}
				}));
			}

			rowWrap.appendChild(Planner.getEntryAvatarNode(entry));

			if (this.showEntryName)
			{
				rowWrap.appendChild(Tag.render`
					<span class="calendar-planner-user-name"></span>
				`)
				.appendChild(BX.create('SPAN', {
					props: {
						className: 'calendar-planner-entry-name'
					},
					attrs: {
						'bx-tooltip-user-id': entry.id,
						'bx-tooltip-classname': 'calendar-planner-user-tooltip'
					},
					style: {
						width: (this.entriesListWidth - 42) + 'px'
					},
					text: entry.name
				}))
			}
		}
		else if (entry.id && entry.type === 'room')
		{
			rowWrap = this.DOM.entrieListWrap.appendChild(Tag.render`
				<div class="calendar-planner-user"></div>
			`);
			if (this.showEntryName)
			{
				rowWrap.appendChild(Tag.render`
					<span class="calendar-planner-user-name"></span>
				`)
				.appendChild(Tag.render`
					<span class="calendar-planner-entry-name" style="width: ${this.entriesListWidth - 20}px;">
						${Text.encode(entry.name)}
					</span>
				`);
			}
			else
			{
				rowWrap.appendChild(Tag.render`
					<div class="calendar-planner-location-image-icon" title="${Text.encode(entry.name)}"></div>
				`);
			}
		}
		else if (entry.type === 'resource')
		{
			if (!this.entriesResourceListWrap || !BX.isNodeInDom(this.entriesResourceListWrap))
			{
				this.entriesResourceListWrap = this.DOM.entrieListWrap.appendChild(Tag.render`
					<div class="calendar-planner-container-resource">
						<div class="calendar-planner-resource-header">
							<span class="calendar-planner-users-item">${Loc.getMessage('EC_PL_RESOURCE_TITLE')}</span>
						</div>
					</div>
				`);
			}

			rowWrap = this.entriesResourceListWrap.appendChild(Tag.render`
				<div class="calendar-planner-user" data-bx-planner-entry="${entry.uid}"></div>
			`);

			if (this.showEntryName)
			{
				rowWrap.appendChild(Tag.render`
					<span class="calendar-planner-user-name"></span>
				`)
				.appendChild(Tag.render`
					<span class="calendar-planner-entry-name" style="width: ${this.entriesListWidth - 20}px;">
						${Text.encode(entry.name)}
					<span>
				`);
			}
			else
			{
				rowWrap.appendChild(Tag.render`
					<div class="calendar-planner-location-image-icon" title="${Text.encode(entry.name)}"></div>
				`);
			}
		}
		else
		{
			rowWrap = this.DOM.entrieListWrap.appendChild(Tag.render`
				<div class="calendar-planner-user"></div>
			`);
			rowWrap.appendChild(Tag.render`
				<div class="calendar-planner-all-users">${Text.encode(entry.name)}</div>
			`);
		}

		let top = rowWrap.offsetTop + 13;

		let dataRowWrap = this.DOM.accessibilityWrap.appendChild(Tag.render`
			<div class="calendar-planner-timeline-space" style="top:${top}px" data-bx-planner-entry="${entry.uid||0}"></div>
		`);

		if (this.selectMode)
		{
			entry.selectorControlWrap = this.selector.controlWrap.appendChild(Tag.render`
				<div class="calendar-planner-selector-control-row" data-bx-planner-entry="${entry.uid}" style="top: ${top - 4}px;"></div>
			`);

			if (entry.selected)
			{
				this.selectEntryRow(entry);
			}
		}

		//this.entriesRowMap.set(entry, rowWrap);
		this.entriesDataRowMap.set(entry.uid, dataRowWrap);
		accessibility.forEach((item) => {
			item = Planner.prepareAccessibilityItem(item);
			if (item)
			{
				this.addAccessibilityItem(item, dataRowWrap);
			}
		});
	}

	static getEntryAvatarNode(entry)
	{
		let imageNode;
		const img = entry.avatar;

		if (!img || img === "/bitrix/images/1.gif")
		{
			let defaultAvatarClass = 'ui-icon-common-user';
			if (entry.emailUser)
			{
				defaultAvatarClass = 'ui-icon-common-user-mail';
			}
			if (entry.sharingUser)
			{
				defaultAvatarClass += ' ui-icon-common-user-sharing';
			}
			imageNode = Tag.render`<div bx-tooltip-user-id="${entry.id}" bx-tooltip-classname="calendar-planner-user-tooltip" title="${Text.encode(entry.name)}" class="ui-icon calendar-planner-user-image-icon ${defaultAvatarClass}"><i></i></div>`;
		}
		else
		{
			imageNode = Tag.render`<div bx-tooltip-user-id="${entry.id}" bx-tooltip-classname="calendar-planner-user-tooltip" title="${Text.encode(entry.name)}" class="ui-icon calendar-planner-user-image-icon"><i style="background-image: url('${encodeURI(entry.avatar)}')"></i></div>`;
		}
		return imageNode;
	}

	selectEntryRow(entry)
	{
		if (BX.type.isPlainObject(entry))
		{
			let top = parseInt(entry.dataRowWrap.offsetTop);
			if (
				!entry.selectWrap
				|| !BX.isParentForNode(this.selectedEntriesWrap, entry.selectWrap)
			)
			{
				entry.selectWrap = this.selectedEntriesWrap.appendChild(Tag.render`
					<div class="calendar-planner-timeline-selected"></div>
				`);
			}

			entry.selectWrap.style.display = '';
			entry.selectWrap.style.top = (top + 36) + 'px';
			entry.selectWrap.style.width = (parseInt(this.DOM.mainWrap.offsetWidth) + 5) + 'px';

			Dom.addClass(entry.selectorControlWrap, 'active');
			entry.selected = true;

			this.clearCacheTime();
		}
	}

	isEntrySelected(entry)
	{
		return entry && entry.selected;
	}

	deSelectEntryRow(entry)
	{
		if (BX.type.isPlainObject(entry))
		{
			if (entry.selectWrap)
			{
				entry.selectWrap.style.display = 'none';
			}
			if (entry.selectorControlWrap)
			{
				Dom.removeClass(entry.selectorControlWrap, 'active');
			}
			entry.selected = false;
			this.clearCacheTime();
		}
	}

	static getEntryUniqueId(entry)
	{
		return ['user', 'room'].includes(entry.type) ? entry.id : entry.type + '-' + entry.id;
	}

	getEntryByUniqueId(entryUniqueId)
	{
		if (BX.type.isArray(this.entries))
		{
			return this.entries.find(function(entry){return entry.uid == entryUniqueId;})
		}
		return null;
	}

	bindEventHandlers()
	{
		Event.bind(this.DOM.wrap, 'click', this.handleClick.bind(this));
		Event.bind(this.DOM.wrap, 'contextmenu', this.handleClick.bind(this));
		Event.bind(this.DOM.wrap, 'mousedown', this.handleMousedown.bind(this));
		Event.bind(document, 'mousemove', this.handleMousemove.bind(this));
		Event.bind(document, 'mouseup', this.handleMouseup.bind(this));

		Event.bind(
			this.DOM.timelineFixedWrap,
			'onwheel' in document ? 'wheel' : 'mousewheel',
			this.mouseWheelTimelineHandler.bind(this)
		);

	}

	handleClick(e)
	{
		if (!e)
		{
			e = window.event;
		}
		e.preventDefault();
		const isRightClick = e.which === 3;
		if (isRightClick || e.target.className === 'calendar-planner-today-button')
		{
			return;
		}

		this.clickMousePos = this.getMousePos(e);
		let
			nodeTarget = e.target || e.srcElement,
			accuracyMouse = 5;

		if (this.selectMode &&
			Dom.hasClass(nodeTarget, 'calendar-planner-selector-control-row'))
		{
			let entry = this.getEntryByUniqueId(nodeTarget.getAttribute('data-bx-planner-entry'));
			if (entry)
			{
				if (!this.isEntrySelected(entry))
				{
					this.selectEntryRow(entry);
				}
				else
				{
					this.deSelectEntryRow(entry);
				}

				this.selector.checkStatus();

				BX.onCustomEvent('OnCalendarPlannerSelectedEntriesOnChange', [{
					plannerId: this.id,
					entries: this.entries
				}]);
			}
			return;
		}

		if (!this.readonly)
		{
			let
				timeline = this.findTarget(nodeTarget, 'timeline'),
				selector = this.findTarget(nodeTarget, 'selector');

			if (timeline && !selector && Math.abs(this.clickMousePos.x - this.mouseDownMousePos.x) < accuracyMouse && Math.abs(this.clickMousePos.y - this.mouseDownMousePos.y) < accuracyMouse)
			{
				const left = this.clickMousePos.x - BX.pos(this.DOM.timelineFixedWrap).left + this.DOM.timelineVerticalConstraint.scrollLeft;
				const mapDatePosRes = this.mapDatePos(this.clickSelectorScaleAccuracy);
				let selectedDateFrom = this.getDateByPos(left, false, mapDatePosRes.posDateMap);
				if (!selectedDateFrom)
				{
					return;
				}
				const selectorTimeLength = this.currentToDate - this.currentFromDate;
				let selectedDateTo = new Date(selectedDateFrom.getTime() + selectorTimeLength);
				this.currentFromDate = selectedDateFrom;
				this.currentToDate = selectedDateTo;

				this.selector.transit({
					toX: this.getPosByDate(selectedDateFrom),
					leftDate: this.currentFromDate,
					rightDate: this.currentToDate
				});
			}
		}
	}

	handleMousedown(e)
	{
		if (!e)
		{
			e = window.event;
		}

		let nodeTarget = e.target || e.srcElement;
		this.mouseDownMousePos = this.getMousePos(e);
		this.mouseDown = true;

		if (!this.readonly)
		{
			let selector = this.findTarget(nodeTarget, 'selector');
			this.startMousePos = this.mouseDownMousePos;

			if (selector)
			{
				if (this.findTarget(nodeTarget, 'selector-resize-right'))
				{
					this.selector.startResize();
				}
				else
				{
					this.selector.startMove();
				}
			}
			else if (this.findTarget(nodeTarget, 'timeline'))
			{
				this.startScrollTimeline();
			}
		}
	}

	handleMouseup()
	{
		if (this.selector.isDragged())
		{
			this.selector.endMove();
			this.selector.endResize();
		}

		if(this.timelineIsDraged)
		{
			this.endScrollTimeline();
		}

		if (this.shown && !this.readonly && this.mouseDown)
		{
			this.checkTimelineScroll();
		}

		this.mouseDown = false;
		Dom.removeClass(document.body, 'calendar-planner-unselectable');
	}

	handleMousemove(e)
	{
		let
			mousePos,
			target = e.target || e.srcElement;

		if (this.selectMode && target && target.getAttribute && target.getAttribute('data-bx-planner-entry'))
		{
			this.lastTouchedEntry = target;
		}

		if (this.selector.isDragged())
		{
			mousePos = this.getMousePos(e);
			this.selector.move(mousePos.x - this.startMousePos.x);
			this.selector.resize(mousePos.x - this.startMousePos.x);
		}

		if(this.timelineIsDraged)
		{
			mousePos = this.getMousePos(e);
			this.scrollTimeline(mousePos.x - this.startMousePos.x);
		}
	}

	mouseWheelTimelineHandler(e)
	{
		e = e || window.event;
		if (this.shown && !this.readonly)
		{
			if (Browser.isMac())
			{
				this.checkTimelineScroll();
			}
			else
			{
				const delta = e.deltaY || e.detail || e.wheelDelta;
				if (Math.abs(delta) > 0)
				{
					this.DOM.timelineVerticalConstraint.scrollLeft = Math.max(
						this.DOM.timelineVerticalConstraint.scrollLeft + Math.round(delta / 3),
						0
					);
					this.checkTimelineScroll();
					return BX.PreventDefault(e);
				}
			}
		}
	}

	updateTodayButtonVisibility(animation = true)
	{
		if (this.isOneDayScale())
		{
			return;
		}

		this.todayButton.style.transition = animation ? '' : 'none';

		const today = new Date();
		today.setHours(this.shownScaleTimeFrom, 0, 0, 0);

		let parent = this.DOM.entriesOuterWrap;
		if (this.todayTitleButton)
		{
			parent = this.todayTitleButton.parentElement;
		}

		const doDisplayTodayButton = today.getTime() < this.scaleDateTo.getTime()
			&& BX.pos(parent).left + 30 < BX.pos(this.DOM.entriesOuterWrap).right;
		if (doDisplayTodayButton && this.todayButton.style.display !== '')
		{
			this.todayButton.style.display = '';
			this.setFutureDayTitlesOffset(false);
		}
		if (!doDisplayTodayButton && this.todayButton.style.display !== 'none')
		{
			this.todayButton.style.display = 'none';
			this.setFutureDayTitlesOffset(false);
		}

		const doAddLeftArrow = BX.pos(this.todayTitleButton).right + (this.todayButtonLeftWidth - this.todayButtonWidth) < BX.pos(this.DOM.entriesOuterWrap).right;
		if (doAddLeftArrow && this.todayButton.innerHTML === this.todayLocMessage)
		{
			this.todayButton.innerHTML = this.todayLocMessage + ' &larr;';
			this.todayButton.style.width = this.todayButtonLeftWidth + 'px';
			this.setFutureDayTitlesOffset(animation);
		}
		if (!doAddLeftArrow && this.todayButton.innerHTML !== this.todayLocMessage)
		{
			this.todayButton.innerHTML = this.todayLocMessage;
			this.todayButton.style.width = this.todayButtonWidth + 'px';
			this.setFutureDayTitlesOffset(animation);
		}

		const isTodayInFuture = today.getTime() > this.scaleDateTo.getTime();
		const doDisplayTodayRightButton = isTodayInFuture || BX.pos(parent).right > BX.pos(this.DOM.timelineVerticalConstraint).right;
		if (doDisplayTodayRightButton && this.todayRightButton.style.display !== '')
		{
			this.todayRightButton.style.display = '';
		}
		if (!doDisplayTodayRightButton && this.todayRightButton.style.display !== 'none')
		{
			this.todayRightButton.style.display = 'none';
		}

		if (this.todayTitleButton)
		{
			if (BX.pos(this.todayTitleButton).right < BX.pos(this.DOM.timelineVerticalConstraint).right)
			{
				this.todayTitleButton.style.position = 'sticky';
			}
			if (BX.pos(this.todayTitleButton).right > BX.pos(this.DOM.timelineVerticalConstraint).right)
			{
				this.todayTitleButton.style.position = '';
			}
		}

		const doAddRightArrow = BX.pos(parent).left > BX.pos(this.DOM.timelineVerticalConstraint).right || isTodayInFuture;
		if (doAddRightArrow && this.todayRightButton.innerHTML === this.todayLocMessage)
		{
			this.todayRightButton.innerHTML = this.todayLocMessage + ' &rarr;';
			this.todayRightButton.style.width = this.todayButtonRightWidth + 'px';
		}
		if (!doAddRightArrow && this.todayRightButton.innerHTML !== this.todayLocMessage)
		{
			this.todayRightButton.innerHTML = this.todayLocMessage;
			this.todayRightButton.style.width = this.todayButtonWidth + 'px';
		}
	}

	setFutureDayTitlesOffset(animation = true)
	{
		const left = this.todayButton.style.display === 'none' ? '' : (parseInt(this.todayButton.style.width) + 4) + 'px';
		for (const title of this.futureDayTitles)
		{
			title.style.transition = animation ? '' : 'none';
			title.style.left = left;
		}
	}

	todayButtonClickHandler()
	{
		if (!this.isTodayButtonEnabled())
		{
			return;
		}

		if (this.todayButtonPivotDay)
		{
			const today = new Date();
			today.setHours(this.shownScaleTimeFrom, 0, 0, 0);
			new BX.easing({
				duration: 300,
				start: {scrollLeft: this.DOM.timelineVerticalConstraint.scrollLeft},
				finish: {scrollLeft: this.getPosByDate(today)},
				transition: BX.easing.makeEaseOut(BX.easing.transitions.quad),
				step: (state)=>{this.DOM.timelineVerticalConstraint.scrollLeft = state.scrollLeft;},
				complete: ()=>{}
			}).animate();
		}
		else
		{
			this.scaleDateFrom = new Date();
			this.scaleDateFrom.setHours(this.shownScaleTimeFrom, 0, 0, 0);

			this.scaleDateTo = new Date(new Date().getTime() + Util.getDayLength() * this.SCALE_OFFSET_AFTER);
			this.scaleDateTo.setHours(this.shownScaleTimeTo, 0, 0, 0);

			this.rebuild();
			this.DOM.timelineVerticalConstraint.scrollLeft = 0;

			this.emit('onExpandTimeline', new BaseEvent({
				data: {
					reload: true,
					dateFrom: this.scaleDateFrom,
					dateTo: this.scaleDateTo
				}
			}));
		}
	}

	isTodayButtonEnabled()
	{
		return !this.readonly && !this.compactMode;
	}

	checkTimelineScroll()
	{
		const minScroll = this.scrollStep;
		const maxScroll = this.DOM.timelineVerticalConstraint.scrollWidth
							- this.DOM.timelineFixedWrap.offsetWidth
							- this.scrollStep;

		// Check and expand only if it is visible
		if (this.DOM.timelineFixedWrap.offsetWidth > 0)
		{
			const today = new Date();
			today.setHours(this.scaleDateFrom.getHours(), 0, 0, 0);
			if ((this.DOM.timelineVerticalConstraint.scrollLeft <= minScroll) && (this.scaleDateFrom.getTime() > today.getTime()))
			{
				this.expandTimelineDirection = 'past';
			}
			if (this.DOM.timelineVerticalConstraint.scrollLeft >= maxScroll)
			{
				this.expandTimelineDirection = 'future';
			}

			if (this.expandTimelineDirection)
			{
				if (!this.isLoaderShown())
				{
					this.showLoader();
				}
				this.expandTimelineDebounce();
			}
		}
	}

	startScrollTimeline()
	{
		this.timelineIsDraged = true;
		this.timelineStartScrollLeft = this.DOM.timelineVerticalConstraint.scrollLeft;
	}
	scrollTimeline(x)
	{
		this.DOM.timelineVerticalConstraint.scrollLeft = Math.max(this.timelineStartScrollLeft - x, 0);
	}
	endScrollTimeline()
	{
		this.timelineIsDraged = false;
	}

	findTarget(node, nodeMetaType, parentCont)
	{
		if (!parentCont)
			parentCont = this.DOM.mainWrap;

		let type = (node && node.getAttribute) ? node.getAttribute('data-bx-planner-meta') : null;

		if (type !== nodeMetaType)
		{
			if (node)
			{
				node = BX.findParent(node, function(n)
				{
					return n.getAttribute && n.getAttribute('data-bx-planner-meta') === nodeMetaType;
				}, parentCont);
			}
			else
			{
				node = null;
			}
		}

		return node;
	}

	getMousePos(e)
	{
		if (!e)
			e = window.event;

		let x = 0, y = 0;
		if (e.pageX || e.pageY)
		{
			x = e.pageX;
			y = e.pageY;
		}
		else if (e.clientX || e.clientY)
		{
			x = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
			y = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
		}

		return {x: x, y: y};
	}

	setScaleType(scaleType)
	{
		if (!this.scaleTypes.includes(scaleType))
		{
			scaleType = '1hour';
		}

		this.scaleType = scaleType;
		this.scaleSize = Planner.getScaleSize(scaleType);

		if (this.isOneDayScale() && this.timelineCellWidth < 100)
		{
			this.timelineCellWidthOrig = this.timelineCellWidth;
			this.timelineCellWidth = 100;
		}
		else if (!this.isOneDayScale() && this.timelineCellWidthOrig)
		{
			this.timelineCellWidth = this.timelineCellWidthOrig;
			this.timelineCellWidthOrig = false;
		}

		if (this.isOneDayScale())
		{
			Dom.addClass(this.DOM.mainWrap, 'calendar-planner-fulldaymode');
			if (this.DOM.entriesOuterWrap)
			{
				Dom.addClass(this.DOM.entriesOuterWrap, 'calendar-planner-no-daytitle');
			}
		}
		else
		{
			Dom.removeClass(this.DOM.mainWrap, 'calendar-planner-fulldaymode');
			if (this.DOM.entriesOuterWrap)
			{
				Dom.removeClass(this.DOM.entriesOuterWrap, 'calendar-planner-no-daytitle');
			}
		}
	}

	static getScaleSize(scaleType)
	{
		let
			hour = 3600,
			map = {
				'15min' : Math.round(hour / 4),
				'30min' : Math.round(hour / 2),
				'1hour' : hour,
				'2hour' : hour * 2,
				'1day' : hour * 24
			};

		return map[scaleType] || hour;
	}

	mapDatePos(accuracy)
	{
		if (!accuracy)
		{
			accuracy = this.accuracy;
		}

		let datePosMap = {};
		let posDateMap = {};
		let i, j, tsi, xi, tsj, xj, cellWidth;

		this.substeps = Math.round(this.scaleSize / accuracy);
		this.posAccuracy = this.timelineCellWidth / this.substeps;

		accuracy = accuracy * 1000;
		let scaleSize = this.scaleData[1].timestamp - this.scaleData[0].timestamp;

		for (i = 0; i < this.scaleData.length; i++)
		{
			tsi = this.scaleData[i].timestamp;
			xi = parseInt(this.scaleData[i].cell.offsetLeft);
			cellWidth = parseInt(this.scaleData[i].cell.offsetWidth);

			if (!datePosMap[tsi])
			{
				datePosMap[tsi] = xi;
			}
			posDateMap[xi] = tsi;

			for (j = 1; j <= cellWidth; j++)
			{
				tsj = tsi + Math.round((j * scaleSize / cellWidth) / accuracy) * accuracy;
				xj = xi + j;
				if (!datePosMap[tsi])
				{
					datePosMap[tsj] = xj;
				}
				posDateMap[xj] = tsj;

				if (j === cellWidth &&
					(!this.scaleData[i + 1] || this.scaleData[i + 1].dayStart))
				{
					datePosMap[xj + '_end'] = tsj;
				}
			}

			if (i + 1 < this.scaleData.length && this.scaleData[i + 1].dayStart)
			{
				const borderStart = xi + cellWidth;
				const borderEnd = parseInt(this.scaleData[i + 1].cell.offsetLeft);
				const borderTimestamp = tsi + scaleSize;
				for (let borderX = borderStart; borderX < borderEnd; borderX++)
				{
					posDateMap[borderX] = borderTimestamp;
				}
			}
		}

		return {
			datePosMap: datePosMap,
			posDateMap: posDateMap
		}
	}

	getPosByDate(date)
	{
		let x = 0;
		if (date && typeof date !== 'object')
		{
			date = Util.parseDate(date);
		}

		if (date && typeof date === 'object')
		{
			let curInd = 0;
			const timestamp = date.getTime();

			for (let i = 0; i < this.scaleData.length; i++)
			{
				if (timestamp >= this.scaleData[i].timestamp)
				{
					curInd = i;
				}
				else
				{
					break;
				}
			}

			if (this.scaleData[curInd] && this.scaleData[curInd].cell)
			{
				x = this.scaleData[curInd].cell.offsetLeft;
				const cellWidth = this.scaleData[curInd].cell.offsetWidth;
				const deltaTs = Math.round((timestamp - this.scaleData[curInd].timestamp) / 1000);

				if (deltaTs > 0)
				{
					x += Math.round(deltaTs * 10 / this.scaleSize * cellWidth) / 10;
				}
			}
		}

		return x;
	}

	getDateByPos(x, end, posDateMap)
	{
		if (!posDateMap)
		{
			posDateMap = this.posDateMap;
		}
		let
			date,
			timestamp = (end && posDateMap[x + '_end']) ? posDateMap[x + '_end'] : posDateMap[x];

		if (!timestamp)
		{
			x = Math.round(x);
			timestamp = (end && posDateMap[x + '_end']) ?  posDateMap[x + '_end'] : posDateMap[x];
		}

		if (timestamp)
		{
			date = new Date(timestamp);
		}

		return date;
	}

	showMoreUsers()
	{
		this.MIN_ENTRY_ROWS = this.MAX_ENTRY_ROWS;
		this.update(this.entries, this.accessibility);
		this.rebuildDebounce();
	}

	adjustHeight()
	{
		let
			newHeight = this.DOM.entrieListWrap.offsetHeight + this.DOM.entrieListWrap.offsetTop + 30,
			currentHeight = parseInt(this.DOM.wrap.style.height) || this.height;

		if (this.compactMode && currentHeight < newHeight || !this.compactMode)
		{
			this.DOM.wrap.style.height = currentHeight + 'px';
			this.resizePlannerHeight(newHeight, Math.abs(newHeight - currentHeight) > 10);
		}
	}

	resizePlannerHeight(height, animation = false)
	{
		this.height = height;
		if (animation)
		{
			// Stop animation before starting another one
			if(this.resizeAnimation)
			{
				this.resizeAnimation.stop();
				this.resizeAnimation = null;
			}
			this.resizeAnimation = new BX.easing({
				duration: 800,
				start: {height: parseInt(this.DOM.wrap.style.height)},
				finish: {height: height},
				transition: BX.easing.makeEaseOut(BX.easing.transitions.quart),
				step: (state) => {
					this.resizePlannerHeight(state.height, false);
				},
				complete: () => {this.resizeAnimation = null;}
			});
			this.resizeAnimation.animate();
		}
		else
		{
			this.DOM.wrap.style.height = height + 'px';
			this.DOM.mainWrap.style.height = height + 'px';
			this.DOM.timelineFixedWrap.style.height = height + 'px';
			let timelineDataContHeight = this.DOM.entrieListWrap.offsetHeight + 3;
			this.DOM.timelineDataWrap.style.height = timelineDataContHeight + 'px';
			// Todo: resize selector
			//this.selector.wrap.style.height = (timelineDataContHeight + 10) + 'px';
			this.DOM.entriesOuterWrap.style.height = height + 'px';

			if (this.DOM.proposeTimeButton && this.DOM.proposeTimeButton.style.display !== "none")
			{
				this.DOM.proposeTimeButton.style.top = (this.DOM.timelineDataWrap.offsetTop + timelineDataContHeight / 2 - 16) + "px";
			}
		}
	}

	resizePlannerWidth(width, animation)
	{
		if (!animation && this.DOM.wrap && this.DOM.mainWrap)
		{
			this.DOM.wrap.style.width = width + 'px';
			let entriesListWidth = this.compactMode ? 0 : this.entriesListWidth;
			this.DOM.mainWrap.style.width = width + 'px';
			this.DOM.entriesOuterWrap.style.width = entriesListWidth + 'px';
		}
	}

	expandTimeline(scaleDateFrom, scaleDateTo)
	{
		let loadedTimelineSize;
		let scrollLeft;
		const prevScaleDateFrom = this.scaleDateFrom;
		const prevScaleDateTo = this.scaleDateTo;

		if (!scaleDateFrom)
		{
			scaleDateFrom = this.scaleDateFrom;
		}
		if (!scaleDateTo)
		{
			scaleDateTo = this.scaleDateTo;
		}

		if (this.expandTimelineDirection === 'past')
		{
			scrollLeft = this.DOM.timelineVerticalConstraint.scrollLeft;
			this.scaleDateFrom = new Date(scaleDateFrom.getTime() - Util.getDayLength()  * this.EXPAND_OFFSET);
			const today = new Date();
			today.setHours(this.scaleDateFrom.getHours(), 0, 0, 0);
			if (this.scaleDateFrom.getTime() < today)
			{
				this.scaleDateFrom = today;
			}

			loadedTimelineSize = (this.scaleDateTo.getTime() - this.scaleDateFrom.getTime()) / Util.getDayLength();
			if (loadedTimelineSize > this.maxTimelineSize)
			{
				this.scaleDateTo = new Date(this.scaleDateFrom.getTime() + Util.getDayLength()  * this.maxTimelineSize);
				this.loadedDataFrom = this.scaleDateFrom;
				this.loadedDataTo = this.scaleDateTo;
				this.limitScaleSizeMode = true;
			}
		}
		else if (this.expandTimelineDirection === 'future')
		{
			let oldDateTo = this.scaleDateTo;
			scrollLeft = this.DOM.timelineVerticalConstraint.scrollLeft;
			this.scaleDateTo = new Date(scaleDateTo.getTime() + Util.getDayLength() * this.EXPAND_OFFSET);
			loadedTimelineSize = (this.scaleDateTo.getTime() - this.scaleDateFrom.getTime()) / Util.getDayLength();

			if (loadedTimelineSize > this.maxTimelineSize)
			{
				this.scaleDateFrom = new Date(this.scaleDateTo.getTime() - Util.getDayLength()  * this.maxTimelineSize);
				this.loadedDataFrom = this.scaleDateFrom;
				this.loadedDataTo = this.scaleDateTo;

				scrollLeft = this.getPosByDate(oldDateTo) - this.DOM.timelineFixedWrap.offsetWidth;
				setTimeout(() => {
					this.DOM.timelineVerticalConstraint.scrollLeft = this.getPosByDate(oldDateTo) - this.DOM.timelineFixedWrap.offsetWidth;
				}, 10);

				this.limitScaleSizeMode = true;
			}
		}
		else
		{
			this.scaleDateFrom = new Date(scaleDateFrom.getTime() - Util.getDayLength()  * this.SCALE_OFFSET_BEFORE);
			this.scaleDateTo = new Date(scaleDateTo.getTime() + Util.getDayLength() * this.SCALE_OFFSET_AFTER);
		}

		const reloadData = this.scaleDateFrom.getTime() < prevScaleDateFrom.getTime()
		|| this.scaleDateTo.getTime() > prevScaleDateTo.getTime();

		this.hideLoader();
		this.emit('onExpandTimeline', new BaseEvent({
			data: {
				reload: reloadData,
				dateFrom: this.scaleDateFrom,
				dateTo: this.scaleDateTo
			} }));

		const currentPlannerWidth = this.DOM.timelineInnerWrap.offsetWidth;
		this.rebuild({
			updateSelector: true
		});

		if (this.expandTimelineDirection === 'past')
		{
			const widthDiff = this.DOM.timelineInnerWrap.offsetWidth - currentPlannerWidth;
			this.DOM.timelineVerticalConstraint.scrollLeft = scrollLeft + widthDiff;
		}
		else if (scrollLeft !== undefined)
		{
			this.DOM.timelineVerticalConstraint.scrollLeft = scrollLeft;
		}

		this.expandTimelineDirection = null;
	}

	getVisibleEvents()
	{
		const visibleEvents = [];

		const timelineFromPosition = this.DOM.timelineVerticalConstraint.scrollLeft;
		const timelineToPosition = timelineFromPosition + this.DOM.timelineFixedWrap.offsetWidth;

		for (const index in this.accessibility)
		{
			for (const event of this.accessibility[index])
			{
				const eventFromPosition = this.getPosByDate(new Date(event.fromTimestamp));
				const eventToPosition = this.getPosByDate(new Date(event.toTimestamp));
				if (
					this.doSegmentsIntersect(eventFromPosition, eventToPosition, timelineFromPosition, timelineToPosition)
					&& event.node
				)
				{
					visibleEvents.push(event);
				}
			}
		}

		return visibleEvents;
	}

	getEventsAfter(events, timestamp)
	{
		const eventsAfter = [];
		for (const event of events)
		{
			if (event.fromTimestamp >= timestamp)
			{
				eventsAfter.push(event);
			}
		}
		return eventsAfter;
	}

	update(entries = [], accessibility = {})
	{
		Dom.clean(this.DOM.entrieListWrap);
		Dom.clean(this.DOM.accessibilityWrap);
		this.entriesDataRowMap = new Map();

		if (!Type.isArray(entries))
		{
			return;
		}

		this.entries = entries;
		this.accessibility = [];
		this.entries.forEach((entry) => {
			this.accessibility[entry.id] = accessibility[entry.id];
		});

		const userId = parseInt(this.userId);

		// sort entries list by amount of accessibility data
		// Entries without accessibility data should be in the end of the array
		// But first in the list will be meeting room
		// And second (or first) will be owner-host of the event
		entries.sort((a, b) => {
			if (b.status === 'h' || parseInt(b.id) === userId && a.status !== 'h')
			{
				return 1;
			}
			if (a.status === 'h' || parseInt(a.id) === userId && b.status !== 'h')
			{
				return  -1;
			}
			if (parseInt(a.id) < parseInt(b.id))
			{
				return -1;
			}
			return 1;
		});

		if (this.selectedEntriesWrap)
		{
			Dom.clean(this.selectedEntriesWrap);
			if (this.selector && this.selector.controlWrap)
			{
				Dom.clean(this.selector.controlWrap);
			}
		}

		const cutData = [];
		const cutDataTitle = [];
		let usersCount = 0;
		let cutAmount = 0;
		let dispDataCount = 0;

		entries.forEach((entry, ind) => {
			entry.uid = Planner.getEntryUniqueId(entry);

			let accData = Type.isArray(accessibility[entry.uid]) ? accessibility[entry.uid] : [];
			this.entriesIndex.set(entry.uid, entry);

			if (entry.type === 'user')
			{
				usersCount++;
			}

			if (ind < this.MIN_ENTRY_ROWS || entries.length === this.MIN_ENTRY_ROWS + 1)
			{
				dispDataCount++;
				this.displayEntryRow(entry, accData);
			}
			else
			{
				cutAmount++;
				cutDataTitle.push(entry.name);
				accData.forEach((item) => {
					item = Planner.prepareAccessibilityItem(item);
					if (item)
					{
						cutData.push(item);
					}
				});
			}
		});

		// Update entries title count
		if (this.entriesListTitleCounter)
		{
			this.entriesListTitleCounter.innerHTML = usersCount > this.MAX_ENTRY_ROWS ? '(' + usersCount + ')' : '';
		}
			this.emit('onDisplayAttendees', new BaseEvent({
				data:  {
					usersCount: usersCount
				}
			}));

		if (cutAmount > 0)
		{
			if (dispDataCount === this.MAX_ENTRY_ROWS)
			{
				this.displayEntryRow({
					name: Loc.getMessage('EC_PL_ATTENDEES_LAST') + ' (' + cutAmount + ')',
					type: 'lastUsers',
					title: cutDataTitle.join(', ')
				}, cutData);
			}
			else
			{
				this.displayEntryRow({
					name: Loc.getMessage('EC_PL_ATTENDEES_SHOW_MORE') + ' (' + cutAmount + ')',
					type: 'moreLink'
				}, cutData);
			}
		}

		this.clearCacheTime();
		const status = this.checkTimePeriod(this.currentFromDate, this.currentToDate) === true;
		this.updateSelectorFromStatus(status);

		Util.extendPlannerWatches({entries: entries, userId: this.userId});

		this.adjustHeight();
	}

	updateSelector(from, to, fullDay, options = {})
	{
		if (this.shown && this.selector)
		{
			this.setFullDayMode(fullDay);

			// Update limits of scale
			if (!this.isOneDayScale())
			{
				if (Util.formatDate(from) !== Util.formatDate(to))
				{
					this.extendScaleTime(0, 24);
				}
				else
				{
					let timeFrom = parseInt(from.getHours()) + Math.floor(from.getMinutes() / 60);
					let timeTo = parseInt(to.getHours()) + Math.ceil(to.getMinutes() / 60);
					let scale = 2;

					if (timeFrom <= this.shownScaleTimeFrom)
					{
						this.extendScaleTime(timeFrom - scale, false);
					}

					if (timeTo >= this.shownScaleTimeTo)
					{
						this.extendScaleTime(false, timeTo + scale);
					}
				}
			}

			if (this.isNeedToExpandTimeline(from, to))
			{
				this.expandTimelineDirection = false;
				this.expandTimeline(from, to);
			}

			this.currentFromDate = from;
			this.currentToDate = to;
			if (!this.selector)
			{
				return;
			}

			if (from.getTime() < this.scaleDateFrom.getTime())
			{
				this.selector.update({
					from: from,
					to: to,
					fullDay: fullDay,
					focus: options.focus !== false
				});
				return;
			}

			this.selector.update({
				from: from,
				to: to,
				fullDay: fullDay
			});

			if (options.focus !== false)
			{
				this.selector.focus(true, 300);
			}
		}
	}

	isNeedToExpandTimeline(from, to)
	{
		return to.getTime() > this.scaleDateTo.getTime()
			|| from.getTime() < this.scaleDateFrom.getTime();
	}

	handleSelectorChanges(event)
	{
		if (event instanceof BaseEvent)
		{
			let data = event.getData();
			this.emit('onDateChange', new BaseEvent({data: data}));
			this.currentFromDate = data.dateFrom;
			this.currentToDate = data.dateTo;

			if (this.currentToDate.getHours() < this.shownScaleTimeFrom
				&& !(this.currentToDate.getHours() === 0 && this.currentToDate.getMinutes() === 0))
			{
				this.extendScaleTime(this.currentToDate.getHours(), false);
			}
		}
	}

	getAllEvents()
	{
		const events = [];
		for (const entryId in this.accessibility)
		{
			if (!this.accessibility.hasOwnProperty(entryId) || !Type.isArray(this.accessibility[entryId]))
			{
				continue;
			}
			for (const event of this.accessibility[entryId])
			{
				events.push(event)
			}
		}
		return events;
	}

	doCheckSelectorStatus(event)
	{
		if (event instanceof BaseEvent)
		{
			const data = event.getData();
			this.clearCacheTime();
			const selectorStatus = this.checkTimePeriod(data.dateFrom, data.dateTo) === true;
			this.updateSelectorFromStatus(selectorStatus)
		}
	}

	updateSelectorFromStatus(status)
	{
		this.selector.setSelectorStatus(status);
		if (this.selector.isDragged())
		{
			this.hideProposeControl();
		}
		if (status)
		{
			Dom.removeClass(this.DOM.mainWrap, 'calendar-planner-selector-warning');
			this.hideProposeControl();
		}
		else
		{
			Dom.addClass(this.DOM.mainWrap, 'calendar-planner-selector-warning');
			if (!this.selector.isDragged())
			{
				this.showProposeControl();
			}
		}
	}

	proposeTime(params = {})
	{
		if (!Type.isPlainObject(params))
		{
			params = {};
		}

		let
			curTimestamp = Math.round(this.selector.getDateFrom().getTime() / (this.accuracy * 1000)) * this.accuracy * 1000,
			curDate = new Date(curTimestamp),
			duration = this.selector.getDuration(),
			data = [], k, i;

		curDate.setSeconds(0,0);
		curTimestamp = curDate.getTime();

		for (k in this.accessibility)
		{
			if (this.accessibility.hasOwnProperty(k) && this.accessibility[k] && this.accessibility[k].length > 0)
			{
				for (i = 0; i < this.accessibility[k].length; i++)
				{
					if (this.accessibility[k][i].toTimestampReal >= curTimestamp)
					{
						let item = Planner.prepareAccessibilityItem(this.accessibility[k][i]);
						if (item)
						{
							data.push(item);
						}
					}
				}
			}
		}
		data.sort(function(a, b){return a.fromTimestamp - b.fromTimestamp});

		let ts = curTimestamp;
		while (true)
		{
			let dateFrom = new Date(ts);
			let dateTo = new Date(ts + duration);

			if (!this.isOneDayScale())
			{
				let timeFrom = parseInt(dateFrom.getHours() + dateFrom.getMinutes() / 60);
				let timeTo = parseInt(dateTo.getHours() + dateTo.getMinutes() / 60);
				if (timeTo === 0)
				{
					timeTo = 24;
				}

				if (timeFrom <= this.shownScaleTimeFrom)
				{
					dateFrom.setHours(this.shownScaleTimeFrom, 0, 0, 0);
					ts = dateFrom.getTime();
					dateTo = new Date(ts + duration);
				}

				if (timeTo > this.shownScaleTimeTo)
				{
					dateFrom = new Date(ts + Util.getDayLength() - 1000); // next day
					dateFrom.setHours(this.shownScaleTimeFrom, 0, 0, 0);
					ts = dateFrom.getTime();
					dateTo = new Date(ts + duration);
				}
			}

			if (this.fullDayMode)
			{
				dateFrom.setHours(0, 0, 0, 0);
				dateTo.setHours(0, 0, 0, 0);
			}

			const checkRes = this.checkTimePeriod(dateFrom, dateTo, data);

			if (checkRes === true)
			{
				if (dateTo.getTime() > this.scaleDateTo.getTime())
				{
					if ((dateTo.getTime() - this.scaleDateTo.getTime()) > this.proposeTimeLimit * Util.getDayLength()
						||
						params.checkedFuture === true)
					{
						Planner.showNoResultNotification();
					}
					else if (params.checkedFuture !== true)
					{
						this.scaleDateTo = new Date(this.scaleDateTo.getTime() + Util.getDayLength() * this.proposeTimeLimit);
						this.expandTimeline(this.scaleDateFrom, this.scaleDateTo);
					}
				}
				else
				{
					if (this.fullDayMode)
						dateTo = new Date(dateTo.getTime() - Util.getDayLength());

					this.currentFromDate = dateFrom;
					this.currentToDate = dateTo;

					this.selector.update({
						from: dateFrom,
						to: dateTo,
						updateScaleType:false,
						updateScaleLimits:true,
						animation: true,
						focus: true
					});

					this.emit('onDateChange', new BaseEvent({data: {
						dateFrom: dateFrom,
						dateTo: dateTo,
						fullDay: this.fullDayMode
					}}));
				}
				break;
			}
			else if (checkRes && checkRes.toTimestampReal)
			{
				ts = checkRes.toTimestampReal;
				if (this.fullDayMode)
				{
					let dt = new Date(ts + Util.getDayLength() - 1000); // next day
					dt.setHours(0, 0, 0, 0);
					ts = dt.getTime();
				}
			}
		}
	}

	checkTimePeriod(fromDate, toDate, data)
	{
		if (!this.currentFromDate)
		{
			return true;
		}

		const timelineFrom = new Date();
		timelineFrom.setHours(this.shownScaleTimeFrom, 0, 0, 0);
		if (this.fullDayMode)
		{
			timelineFrom.setHours(0, 0, 0, 0);
		}
		if (fromDate && fromDate.getTime() < timelineFrom.getTime())
		{
			return true;
		}

		let result = true;
		let entry;

		if (!Type.isDate(fromDate) || !Type.isDate(toDate))
		{
			return result;
		}

		let fromTimestamp = fromDate.getTime();
		let toTimestamp = toDate.getTime();
		const cacheKey = fromTimestamp + '_' + toTimestamp;
		const accuracy = 3 * 60 * 1000; // 3min

		if (Type.isArray(data))
		{
			for (let i = 0; i < data.length; i++)
			{
				let item = data[i];
				if (item.type && item.type === 'hr')
				{
					continue;
				}

				if ((item.fromTimestamp + accuracy) <= toTimestamp && ((item.toTimestampReal || item.toTimestamp) - accuracy) >= fromTimestamp)
				{
					result = item;
					break;
				}
			}
		}
		else if (Type.isArray(this.entries))
		{
			let
				entriesAccessibleIndex = {},
				selectorAccuracy = this.selectorAccuracy * 1000,
				entryId;

			if (this.checkTimeCache[cacheKey] !== undefined)
			{
				result = this.checkTimeCache[cacheKey];
			}
			else
			{
				for (entryId in this.accessibility)
				{
					if (this.accessibility.hasOwnProperty(entryId))
					{
						entry = this.entries.find(function(el){return el.id === entryId.toString();});

						if (!entry || this.selectMode && !entry.selected)
						{
							continue;
						}

						entriesAccessibleIndex[entryId] = true;
						if (Type.isArray(this.accessibility[entryId]))
						{
							for (let i = 0; i < this.accessibility[entryId].length; i++)
							{
								let item = this.accessibility[entryId][i];
								if (item.type && item.type === 'hr')
								{
									continue;
								}

								if ((item.fromTimestamp + selectorAccuracy) <= toTimestamp && ((item.toTimestampReal || item.toTimestamp) - selectorAccuracy) >= fromTimestamp)
								{
									entriesAccessibleIndex[entryId] = false;
									result = item;
									break;
								}
							}
						}
					}
				}

				this.checkTimeCache[cacheKey] = result;
			}
		}

		return result;
	}

	clearCacheTime()
	{
		this.checkTimeCache = {};
	}

	checkEntryTimePeriod(entry, fromDate, toDate)
	{
		let data = [], i;
		if (entry && entry.id && BX.type.isArray(this.accessibility[entry.id]))
		{
			for (i = 0; i < this.accessibility[entry.id].length; i++)
			{
				let item = Planner.prepareAccessibilityItem(this.accessibility[entry.id][i]);
				if (item)
				{
					data.push(item);
				}
			}
		}
		return this.checkTimePeriod(fromDate, toDate, data) === true;
	}

	showSettingsPopup()
	{
		let	settingsDialogCont = Tag.render`<div class="calendar-planner-settings-popup"></div>`;
		let scaleRow = settingsDialogCont.appendChild(Tag.render`
			<div class="calendar-planner-settings-row">
				<i>${Loc.getMessage('EC_PL_SETTINGS_SCALE')}:</i>
			</div>
		`);
		let scaleWrap = scaleRow.appendChild(Tag.render`
			<span class="calendar-planner-option-container"></span>
		`);


		if (this.fullDayMode)
		{
			scaleRow.title = Loc.getMessage('EC_PL_SETTINGS_SCALE_READONLY_TITLE');
			Dom.addClass(scaleRow, 'calendar-planner-option-container-disabled');
		}

		this.scaleTypes.forEach((scale)=>{
			scaleWrap.appendChild(Tag.render`<span class="calendar-planner-option-tab ${(scale === this.scaleType ? ' calendar-planner-option-tab-active' : '')}" data-bx-planner-scale="${scale}">${Loc.getMessage('EC_PL_SETTINGS_SCALE_' + scale.toUpperCase())}</span>`);
		});


		// Create and show settings popup
		let popup = PopupWindowManager.create(
			this.id + "-settings-popup",
			this.DOM.settingsButton,
			{
				autoHide: true,
				closeByEsc: true,
				offsetTop: -1,
				offsetLeft: 7,
				lightShadow: true,
				content: settingsDialogCont,
				zIndex: 4000,
				angle: {postion: 'top'},
				cacheable: false
			});
		popup.show(true);

		Event.bind(scaleWrap, 'click', (e) => {
			if (!this.fullDayMode)
			{
				let
					nodeTarget = e.target || e.srcElement,
					scale = nodeTarget && nodeTarget.getAttribute && nodeTarget.getAttribute('data-bx-planner-scale');

				if (scale)
				{
					this.changeScaleType(scale);
					popup.close();
				}
			}
		});
	}

	changeScaleType(scaleType)
	{
		if (scaleType !== this.scaleType)
		{
			this.setScaleType(scaleType);
			this.rebuild();
		}
	}

	setFullDayMode(fullDayMode)
	{
		if (fullDayMode !== this.fullDayMode)
		{
			this.fullDayMode = fullDayMode;
			if (fullDayMode && !this.isOneDayScale())
			{
				this.savedScaleType = this.scaleType;
				this.changeScaleType('1day');
			}
			else if (!fullDayMode && this.isOneDayScale() && this.savedScaleType)
			{
				this.changeScaleType(this.savedScaleType);
				this.savedScaleType = null;
			}
		}
	}

	static showNoResultNotification()
	{
		alert(Loc.getMessage('EC_PL_PROPOSE_NO_RESULT'));
	}

	showProposeControl()
	{
		if (!this.DOM.proposeTimeButton)
		{
			this.DOM.proposeTimeButton = this.DOM.mainWrap.appendChild(Tag.render`
				<div class="calendar-planner-time-arrow-right">
					<span class="calendar-planner-time-arrow-right-text">
						${Loc.getMessage('EC_PL_PROPOSE')}
					</span>
					<span class="calendar-planner-time-arrow-right-item"></span>
				</div>
			`);
			Event.bind(this.DOM.proposeTimeButton, 'click', this.proposeTime.bind(this));

			if (this.isLocked())
			{
				Dom.addClass(this.DOM.proposeTimeButton, '--lock');
			}
		}
		this.DOM.proposeTimeButton.style.display = "block";
		this.DOM.proposeTimeButton.style.top = (this.DOM.timelineDataWrap.offsetTop + this.DOM.timelineDataWrap.offsetHeight / 2 - 16) + "px";
	}

	hideProposeControl()
	{
		if (this.DOM.proposeTimeButton)
		{
			this.DOM.proposeTimeButton.style.display = "none";
		}
	}

	mouseMoveHandler(e)
	{
		let
			i, nodes,
			entryUid, parentTarget,
			prevEntry,
			mainContWrap = this.DOM.mainWrap,
			target = e.target || e.srcElement;

		entryUid = target.getAttribute('data-bx-planner-entry');
		if (!entryUid)
		{
			parentTarget = BX.findParent(target,
				function(node)
				{
					if (node == mainContWrap ||
						node.getAttribute && node.getAttribute('data-bx-planner-entry')
					)
					{
						return true;
					}
				},
				mainContWrap
			);

			if (parentTarget)
			{
				entryUid = target.getAttribute('data-bx-planner-entry')
			}
			else
			{
				Dom.removeClass(this.hoverRow, 'show');
				nodes = this.selector.controlWrap.querySelectorAll('.calendar-planner-selector-control-row.hover');
				for (i = 0; i < nodes.length; i++)
				{
					Dom.removeClass(nodes[i], 'hover');
				}
				prevEntry = this.getEntryByUniqueId(this.howerEntryId);
				if (prevEntry && prevEntry.selectWrap)
				{
					prevEntry.selectWrap.style.opacity = 1;
				}
			}
		}

		if (entryUid)
		{
			if (this.howerEntryId !== entryUid)
			{
				this.howerEntryId = entryUid;
				let entry = this.getEntryByUniqueId(entryUid);
				if (entry)
				{
					let top = parseInt(entry.dataRowWrap.offsetTop);
					Dom.addClass(this.hoverRow, 'show');
					this.hoverRow.style.top = (top + 36) + 'px';
					this.hoverRow.style.width = (parseInt(this.DOM.mainWrap.offsetWidth) + 5) + 'px';

					if (entry.selectorControlWrap)
					{
						nodes = this.selector.controlWrap.querySelectorAll('.calendar-planner-selector-control-row.hover');
						for (i = 0; i < nodes.length; i++)
						{
							Dom.removeClass(nodes[i], 'hover');
						}
						Dom.addClass(entry.selectorControlWrap, 'hover');
					}
				}
			}
		}
	}

	showLoader()
	{
		this.hideLoader();
		this.DOM.loader = this.DOM.mainWrap.appendChild(Util.getLoader(50));
		Dom.addClass(this.DOM.loader, 'calendar-planner-main-loader');
		this.loaderShown = true;
	}

	hideLoader()
	{
		if(Type.isDomNode(this.DOM.loader))
		{
			Dom.remove(this.DOM.loader);
		}
		this.loaderShown = false;
	}

	isLoaderShown()
	{
		return this.loaderShown;
	}

	isShown()
	{
		return this.shown;
	}

	isBuilt()
	{
		return this.built;
	}

	isLocked()
	{
		return this.locked;
	}

	lock()
	{
		if (!this.DOM.lockScreen)
		{
			this.DOM.lockScreen = Tag.render`
				<div class="calendar-planner-timeline-locker">
					<div class="calendar-planner-timeline-locker-container">
						<div class="calendar-planner-timeline-locker-top">
							<div class="calendar-planner-timeline-locker-icon"></div>
							<div class="calendar-planner-timeline-text">${Loc.getMessage('EC_PL_LOCKED_TITLE')}</div>
						</div>
						<div class="calendar-planner-timeline-locker-button">
							<a href="javascript:void(0)" onclick="top.BX.UI.InfoHelper.show('limit_crm_calender_planner');" class="ui-btn ui-btn-sm ui-btn-light-border ui-btn-round">${Loc.getMessage('EC_PL_UNLOCK_FEATURE')}</a>
						</div>
					</div>
				</div>
			`;
		}

		Dom.addClass(this.DOM.timelineFixedWrap, '--lock');
		this.DOM.timelineFixedWrap.appendChild(this.DOM.lockScreen);
	}

	doSegmentsIntersect(x1, x2, y1, y2)
	{
		return (x1 >= y1 && x1 <= y2)
			|| (x2 >= y1 && x2 <= y2)
			|| (x1 <= y1 && x2 >= y2);
	}
}
