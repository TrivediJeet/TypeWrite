// tslint:disable-next-line: max-line-length
import { Injectable, Injector, ComponentFactoryResolver, EmbeddedViewRef, ApplicationRef, ViewContainerRef, ComponentRef } from '@angular/core';

interface IDictionary {
	[key: string]: any;
}

@Injectable({
	providedIn: 'root'
})
export class DomService {

	// Holds reference to the dynamically created component so it can later be removed
	private metricsComponentRef: ComponentRef<{}>;

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private appRef: ApplicationRef,
		private injector: Injector
	) { }

	appendComponentToBody(component: any) {
		// 1. Create a component reference from the component
		const componentRef = this.componentFactoryResolver
			.resolveComponentFactory(component)
			.create(this.injector);

		// 2. Attach component to the appRef so that it's inside the ng component tree
		this.appRef.attachView(componentRef.hostView);

		// 3. Get DOM element from component
		const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
			.rootNodes[0] as HTMLElement;

		// 4. Append DOM element to the body
		document.body.appendChild(domElem);

		// 5. Wait some time and remove it from the component tree and from the DOM
		setTimeout(() => {
			this.appRef.detachView(componentRef.hostView);
			componentRef.destroy();
		}, 3000);
	}

	// Creates component in the given view contrainer and optionally sets input bindings
	// also holds refrence to the created component in the metricsComponentRef member var TODO
	appendComponentAsSibling(component: any, viewContainerRef: ViewContainerRef, inputBindingProperties?: IDictionary) {
		const componentRef = viewContainerRef.createComponent(this.componentFactoryResolver.resolveComponentFactory(component));

		Object.keys(inputBindingProperties).forEach(key => {
			componentRef.instance[key] = inputBindingProperties[key];
		});

		this.metricsComponentRef = componentRef;
		return componentRef;
	}

	// Removes the component the metricsComponentRef member variable is currently referencing
	clearUI() {
		if (this.metricsComponentRef) {
			this.metricsComponentRef.hostView.detach();
			this.metricsComponentRef.destroy();
		}
	}
}
