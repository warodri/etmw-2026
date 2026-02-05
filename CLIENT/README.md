

    <div class="p-md-5 p-4 row justify-content-center gap-5">

        <!--
            CARD LEFT
        -->
        <div class="position-relative card-left etmw-bg-secondary rounded-5 shadow col-12 col-md-4">
            <img src="pattern.png" style="width: 70%; right:0; z-index:0" class="position-absolute" />
            <div class="p-5">

                <!-- Top -->
                 <div>
                    <div class="d-flex justify-content-between align-items-center gap-3">
                        <div class="text-secondary">
                            <i class="bi bi-search"></i>
                        </div>
                        <div class="text-secondary">
                            <app-translate en="Discover" es="Descubre"></app-translate>
                        </div>
                        <div>
                            <i class="bi bi-sliders"></i>
                        </div>
                    </div>
                 </div>
                 
                 <!-- This week's compilations -->
                <div class="mt-4">
                    <div class="fw-bold">
                        This Week's Compilations
                    </div>
                    <div class="mt-3">
                        <div class="d-flex justify-content-between align-items-center gap-3 etmw-bg-main rounded-4 px-4 pt-3 pb-3">
                            <div>
                                How to stop feeling like sh**t
                            </div>
                            <button class="btn btn-dark btn-sm rounded-pill">
                                Listen
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Recommended -->
                <div class="mt-4">
                    <div class="fw-bold">                        
                        <button class="btn btn-dark rounded-pill">
                            <i class="bi bi-hand-thumbs-up"></i> 
                        </button>&nbsp;                        
                        Recommended for You
                    </div>
                    <div class="mt-4">
                        <div class="d-flex justify-content-start align-items-center gap-3 pb-4 overflow-auto">
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                        </div>
                    </div>
                </div>
                
                <!-- Latest -->
                <div class="mt-4">
                    <div class="fw-bold">                        
                        <button class="btn btn-dark rounded-pill">
                            <i class="bi bi-play-circle"></i>
                        </button>&nbsp;                        
                        Latest
                    </div>
                    <div class="mt-4">
                        <div class="d-flex justify-content-start align-items-center gap-3 pb-4 overflow-auto">
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                            <img src="https://www.entertomyworld.com/images/never-delete/away.cover.front.png" class="rounded-4 overflow-hidden shadow" style="min-width:100px" />
                        </div>
                    </div>
                </div>


                <!-- Categories -->
                <div class="mt-4">
                    @for (item of categories(); track item ) {
                        <div class="d-flex justify-content-center align-items-center gap-3 etmw-bg-main rounded-4 p-3 mb-3">
                            <div>
                                {{ item.label }}
                            </div>
                            <div class="etmw-bg-secondary p-2 rounded-pill">
                                <h4 class="m-0">
                                    {{ item.emoji }}
                                </h4>
                            </div>
                        </div>
                    }
                </div>

                <div class="py-5"></div>

                <div class="position-absolute p-3 etmw-bg-secondary rounded-4 w-100" style="left:0px; bottom:0px;">
                    <div class="d-flex justify-content-around align-items-center gap-5">
                        <button class="btn btn-lg btn-light rounded-4">
                            <h3 class="m-0"><i class="bi bi-book"></i></h3>
                        </button>
                        <button class="btn btn-lg btn-dark rounded-4">
                            <h3 class="m-0"><i class="bi bi-heart"></i></h3>
                        </button>
                        <button class="btn btn-lg btn-dark rounded-4">
                            <h3 class="m-0"><i class="bi bi-bag"></i></h3>
                        </button>
                        <button class="btn btn-lg btn-dark rounded-4">
                            <h3 class="m-0"><i class="bi bi-three-dots"></i></h3>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="position-relative card-right etmw-bg-secondary rounded-5 shadow col-12 col-md-4">
            <img src="pattern.png" style="width: 70%; right:0; z-index:0" class="position-absolute" />
            <div class="p-5">

                <!-- User Profile -->
                <div class="d-flex justify-content-between align-items-center gap-3 border-bottom border-secondary pb-3">
                    <div class="d-flex justify-content-start align-items-center gap-3">
                        <h2>
                            👤
                        </h2>
                        <div>
                            <b>Walter</b>
                            <div class="text-secondary small">
                                Finish your profile
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-light rounded-pill">
                        Your Profile
                    </button>
                </div>       
                
                
                <!-- Upload your work -->
                <div class="mt-4 etmw-bg-main rounded-4 p-4">
                    <div class="d-flex justify-content-between align-items-center gap-3">
                        <h5 class="m-0">
                            <b>Upoad your Work</b>
                        </h5>
                        <button class="btn btn-sm btn-dark rounded-pill">
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                    <div class="mt-2 small text-secondary">
                        Upload your book or essay. We turn them into audiobooks at no cost and distribute them directly on our platform.
                    </div>
                </div>
                
                <!-- Debate -->
                <div class="mt-4 etmw-bg-main rounded-4 p-4">
                    <div class="d-flex justify-content-between align-items-center gap-3">
                        <h5 class="m-0">
                            <b>Debate</b>
                        </h5>
                        <button class="btn btn-sm btn-dark rounded-pill">
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                    <div class="mt-2 small text-secondary">
                        Choose an audiobook and join the conversation with the author and the community.
                    </div>
                </div>

                <!-- Users -->
                <div class="mt-4 etmw-bg-main rounded-4 p-4">
                    <div class="d-flex justify-content-between align-items-center gap-3">
                        <h5 class="m-0">
                            <b>Latest Authors</b>
                        </h5>
                        <button class="btn btn-sm btn-dark rounded-pill">
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                    <div class="mt-2 small">
                        @for (item of latestAuthors(); track item ) {
                            <div class="mt-4 d-flex justify-content-start align-items-center gap-3">
                                <div>
                                    <img [src]="item.userPhoto" style="width:50px; height:50px; object-fit:cover" class="rounded-circle shadow overflow-hidden" />
                                </div>
                                <div>
                                    <b>{{ item.name }}</b>
                                    <div class="mt-1 text-secondary">
                                        {{ item.lastUpload }}
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>


                <!-- Pricing -->
                <div class="mt-4 rounded-4 p-4">
                    <div class="d-flex justify-content-between align-items-center gap-3">
                        <h5 class="m-0">
                            <b>Our Pricing</b>
                        </h5>
                        <button class="btn btn-sm btn-dark rounded-pill">
                            <i class="bi bi-arrow-right"></i>
                        </button>
                    </div>
                    <div class="mt-2 small text-secondary">
                        Pick a plan that works for you. 
                        Enjoy unlimited access to all audiobooks on our platform.
                    </div>
                    <div class="mt-3">
                        <div class="d-flex justify-content-start align-items-start gap-3">
                            <button class="btn btn-lg btn-dark rounded-pill">
                                <span class="small">$</span><b>2.99</b>
                            </button>
                            <div class="mt-2">
                                <b>Starter</b>
                                <div class="text-secondary small">
                                    Pick up to 2 audiobook per month. 
                                    Debate with authors and community.
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                
                
            </div>
        </div>

    </div>


    <!--
        Landing - footer
    -->
    <div class="d-flex justify-content-center align-items-center gap-3 pt-5">
        <button class="btn btn-dark text-secondary small">
            About
        </button>
        <button class="btn btn-dark text-secondary small">
            Privacy Policy
        </button>
        <button class="btn btn-dark text-secondary small">
            Terms of Service
        </button>
        <button class="btn btn-dark text-secondary small">
            Contact
        </button>
    </div>
    <div class="mt-2 text-center px-3 pt-3 pb-5 text-secondary small">
        &copy; 2024 Enter To My World. All rights reserved.
    </div>